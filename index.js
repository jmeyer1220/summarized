import nlp from 'compromise';

// Mock Slack messages for demonstration
const mockSlackMessages = [
  { text: "We need to fix the login bug by Friday", user: "Sarah", timestamp: "2024-01-10" },
  { text: "The client requested changes to the dashboard layout", user: "John", timestamp: "2024-01-10" },
  { text: "Successfully deployed new features to production", user: "Mike", timestamp: "2024-01-10" },
  { text: "Meeting with client scheduled for next Tuesday", user: "Sarah", timestamp: "2024-01-10" }
];

function analyzeMessages(messages) {
  // Group messages by day
  const messagesByDay = messages.reduce((acc, msg) => {
    const date = msg.timestamp;
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  // Analyze each day's messages
  Object.entries(messagesByDay).forEach(([date, dayMessages]) => {
    console.log(`\nSummary for ${date}:`);
    
    // Extract key topics and actions
    const combinedText = dayMessages.map(m => m.text).join('. ');
    const doc = nlp(combinedText);
    
    // Find action items (verbs in present/future tense)
    const actions = doc.verbs().json();
    console.log('\nAction Items:');
    actions.forEach(action => {
      if (action.text.length > 3) { // Filter out small words
        console.log(`- ${action.text}`);
      }
    });

    // Find key topics (nouns)
    const topics = doc.nouns().json();
    console.log('\nKey Topics:');
    const uniqueTopics = new Set(topics.map(t => t.text));
    uniqueTopics.forEach(topic => {
      if (topic.length > 3) { // Filter out small words
        console.log(`- ${topic}`);
      }
    });

    // Identify potential hurdles/issues
    const hurdles = dayMessages.filter(msg => 
      msg.text.toLowerCase().includes('bug') ||
      msg.text.toLowerCase().includes('issue') ||
      msg.text.toLowerCase().includes('fix') ||
      msg.text.toLowerCase().includes('problem')
    );
    
    if (hurdles.length > 0) {
      console.log('\nPotential Hurdles:');
      hurdles.forEach(h => console.log(`- ${h.text}`));
    }
  });
}

// Run the analysis
console.log('🤖 Slack Channel Summarizer POC');
console.log('================================');
analyzeMessages(mockSlackMessages);

// Example of how this would connect to Google Docs
function updateGoogleDoc(summary) {
  console.log('\n📝 In a production environment, this summary would be appended to Google Doc');
  // Would use Google Docs API here
  // document.append(summary);
}