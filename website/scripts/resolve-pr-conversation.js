const { execSync } = require('child_process');

/**
 * Adds a comment to a specific review thread
 * @param {string} threadId - The thread ID to add comment to
 * @param {string} comment - The comment text to add
 */
function addCommentToThread(threadId, comment) {
  try {
    // eslint-disable-next-line no-console
    console.log(`Adding comment to thread: ${threadId}`);

    const query = `mutation {
      addPullRequestReviewThreadReply(input: {
        pullRequestReviewThreadId: "${threadId}",
        body: "${comment.replace(/\\/gu, '\\\\').replace(/"/gu, '\\"').replace(/\n/gu, '\\n')}"
      }) {
        comment {
          id
        }
      }
    }`;

    const result = execSync(`gh api graphql -f query='${query}'`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const response = JSON.parse(result);

    if (response.data?.addPullRequestReviewThreadReply?.comment) {
      // eslint-disable-next-line no-console
      console.log(`✅ Successfully added comment to thread`);
    } else if (response.errors) {
      // eslint-disable-next-line no-console
      console.error('❌ GitHub API errors:');
      response.errors.forEach((error) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${error.message}`);
      });
      throw new Error('Failed to add comment to thread');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to add comment to thread:', error);
    throw error;
  }
}

/**
 * Resolves a GitHub review thread (conversation) using the provided thread ID
 * @param {string} conversationId - The GitHub review thread ID to resolve
 * @param {string} [comment] - Optional comment to add before resolving
 */
function resolveConversation(conversationId, comment) {
  if (!conversationId) {
    // eslint-disable-next-line no-console
    console.error('Error: conversationId is required');
    // eslint-disable-next-line no-console
    console.log(
      'Usage: npm run resolve-conversation <conversationId> [comment]',
    );
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log(
      'If a comment is provided, it will be added to the conversation thread before resolving.',
    );
    process.exit(1);
  }

  try {
    // Add comment to thread if provided
    if (comment) {
      addCommentToThread(conversationId, comment);
    }

    // Resolve the thread
    const query = `mutation { 
      resolveReviewThread(input: {threadId: "${conversationId}"}) { 
        thread { id isResolved } 
      } 
    }`;

    // eslint-disable-next-line no-console
    console.log(`Resolving conversation: ${conversationId}`);

    const result = execSync(`gh api graphql -f query='${query}'`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const response = JSON.parse(result);

    if (response.data?.resolveReviewThread?.thread) {
      const { thread } = response.data.resolveReviewThread;
      // eslint-disable-next-line no-console
      console.log(`✅ Successfully resolved conversation ${thread.id}`);

      let status = 'Not resolved';
      if (thread.isResolved) {
        status = 'Resolved';
      }
      console.log(`Status: ${status}`);
    } else if (response.errors) {
      // eslint-disable-next-line no-console
      console.error('❌ GitHub API errors:');
      response.errors.forEach((error) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${error.message}`);
      });
      process.exit(1);
    } else {
      // eslint-disable-next-line no-console
      console.error('❌ Unexpected response format');
      process.exit(1);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to resolve conversation:', error);
    process.exit(1);
  }
}

// Get conversationId and optional comment from command line arguments
const [, , conversationId, comment] = process.argv;

// Call the function and handle it properly
try {
  resolveConversation(conversationId, comment);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to resolve conversation:', error);
  process.exit(1);
}
