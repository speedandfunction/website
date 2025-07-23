/* eslint-disable no-console */

const { execSync } = require('child_process');

function getPRNumber() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: list-pr-comments.js [PR_NUMBER]');
    process.exit(1);
  }
  return args[0];
}

function buildGraphQLQuery() {
  return `
    query($prNumber: Int!) {
      repository(owner: "speedandfunction", name: "website") {
        pullRequest(number: $prNumber) {
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
              comments(first: 10) {
                nodes {
                  path
                  line
                  body
                  createdAt
                  outdated
                  diffHunk
                  url
                  author {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
}

function parseConversations(data) {
  const conversations = [];

  data.data.repository.pullRequest.reviewThreads.nodes
    .filter((thread) => !thread.isResolved)
    .forEach((thread) => {
      const comments = thread.comments.nodes.map((comment) => ({
        file: comment.path,
        line: comment.line,
        author: comment.author.login,
        body: comment.body,
        createdAt: comment.createdAt,
        outdated: comment.outdated,
        resolved: thread.isResolved,
        diffHunk: comment.diffHunk,
        url: comment.url,
      }));

      conversations.push({
        id: thread.id,
        isResolved: thread.isResolved,
        comments,
      });
    });

  return conversations;
}

function getPRComments(prNumber) {
  const query = buildGraphQLQuery();

  try {
    const result = execSync(
      `gh api graphql -f query='${query}' -F prNumber=${prNumber}`,
      { encoding: 'utf8' },
    );

    const data = JSON.parse(result);
    const conversations = parseConversations(data);

    // Sort by creation date of first comment in each conversation
    conversations.sort((a, b) => {
      const aFirstComment = a.comments[0]?.createdAt || '';
      const bFirstComment = b.comments[0]?.createdAt || '';
      return (
        new Date(aFirstComment).getTime() - new Date(bFirstComment).getTime()
      );
    });

    // Output JSON by default for programmatic use
    console.log(JSON.stringify(conversations, null, 2));
  } catch (error) {
    console.error('Error fetching PR comments:', error);
    process.exit(1);
  }
}

// Main execution
const prNumber = getPRNumber();
getPRComments(prNumber);
