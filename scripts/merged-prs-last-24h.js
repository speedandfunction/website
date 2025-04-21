#!/usr/bin/env node

const https = require('https');

// Configuration - replace these values with your own
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set your GitHub token as an environment variable
const OWNER = process.env.GITHUB_OWNER || 'your-organization-or-username';
const REPO = process.env.GITHUB_REPO || 'your-repository-name';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL; // Slack webhook URL
const SLACK_CHANNEL = process.env.SLACK_CHANNEL; // Optional specific Slack channel to post to
const BOT_NAME = process.env.BOT_NAME || 'PRs_bot'; // Custom bot name for Slack messages

// Calculate timestamp for 24 hours ago
const now = new Date();
const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
const timestamp = twentyFourHoursAgo.toISOString();

// Build the GitHub API request options
const options = {
  hostname: 'api.github.com',
  path: `/repos/${OWNER}/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=100`,
  method: 'GET',
  headers: {
    'User-Agent': 'PR-Counter-Script',
    'Accept': 'application/vnd.github.v3+json',
  }
};

// Add Authorization header only if GITHUB_TOKEN is provided
if (GITHUB_TOKEN) {
  options.headers.Authorization = `token ${GITHUB_TOKEN}`;
}

// Function to get emoji and message based on PR count
function getMessageStyle(count) {
  if (count < 4) {
    return {
      emoji: ':disappointed:', 
      message: `Only ${count} PRs merged in the last 24 hours. We need to pick up the pace! Let's aim for more productivity tomorrow.`
    };
  } else {
    return {
      emoji: ':rocket:', 
      message: `Great job team! ${count} PRs merged in the last 24 hours. Keep up the excellent work! :clap:`
    };
  }
}

// Function to post results to Slack
function postToSlack(message) {
  if (!SLACK_WEBHOOK_URL) {
    console.log('Slack webhook URL not provided. Skipping Slack notification.');
    return;
  }

  // Parse the webhook URL
  const webhookUrl = new URL(SLACK_WEBHOOK_URL);
  
  // Create Slack payload
  const payload = {
    text: message,
    username: BOT_NAME,
    icon_emoji: ':bar_chart:'
  };
  
  // Add channel override if specified
  if (SLACK_CHANNEL) {
    payload.channel = SLACK_CHANNEL;
    console.log(`Posting to Slack channel: ${SLACK_CHANNEL}`);
  }
  
  const postData = JSON.stringify(payload);
  
  const slackOptions = {
    hostname: webhookUrl.hostname,
    path: webhookUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const slackReq = https.request(slackOptions, (res) => {
    if (res.statusCode === 200) {
      console.log('Successfully posted to Slack!');
    } else {
      console.error(`Failed to post to Slack. Status code: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.error(data);
      });
    }
  });
  
  slackReq.on('error', (error) => {
    console.error('Error posting to Slack:', error);
  });
  
  slackReq.write(postData);
  slackReq.end();
}

// Make the GitHub API request
const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`Error: Received status code ${res.statusCode}`);
      console.error(data);
      process.exit(1);
    }
    
    try {
      const pulls = JSON.parse(data);
      
      // Filter PRs merged in the last 24 hours
      const recentlyMergedPRs = pulls.filter(pr => {
        return pr.merged_at && pr.merged_at >= timestamp;
      });
      
      const count = recentlyMergedPRs.length;
      console.log(`Number of PRs merged in the last 24 hours: ${count}`);
      
      // Get message style based on PR count
      const style = getMessageStyle(count);
      
      // Build message for console and Slack
      let message = `${style.emoji} *PR Summary for ${OWNER}/${REPO}* ${style.emoji}\n`;
      message += `${style.message}\n`;
      
      // Optionally display the PRs
      if (count > 0) {
        console.log('\nList of recently merged PRs:');
        message += "\n*Recently merged PRs:*\n";
        
        recentlyMergedPRs.forEach(pr => {
          const prLine = `- <${pr.html_url}|#${pr.number}>: ${pr.title} (merged at ${new Date(pr.merged_at).toLocaleString()})`;
          console.log(`- #${pr.number}: ${pr.title} (merged at ${new Date(pr.merged_at).toLocaleString()})`);
          message += prLine + "\n";
        });
      }
      
      if (count === 0) {
        message += "\n:warning: *No PRs were merged in the last 24 hours* :warning:";
      }
      
      // Post to Slack if webhook URL is provided
      postToSlack(message);
      
    } catch (error) {
      console.error('Error parsing response:', error);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error);
  process.exit(1);
});

req.end(); 