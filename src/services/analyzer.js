import nlp from 'compromise';
import { formatSummary } from '../utils/formatter.js';

export async function analyzeChannel(messages) {
  const messagesByDay = groupMessagesByDay(messages);
  const analysis = await analyzeDays(messagesByDay);
  return formatSummary(analysis);
}

function groupMessagesByDay(messages) {
  return messages.reduce((acc, msg) => {
    const date = msg.timestamp;
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});
}

async function analyzeDays(messagesByDay) {
  const analysis = {};

  for (const [date, messages] of Object.entries(messagesByDay)) {
    analysis[date] = {
      actionItems: extractActionItems(messages),
      keyTopics: extractKeyTopics(messages),
      hurdles: identifyHurdles(messages),
      decisions: identifyDecisions(messages),
      updates: identifyUpdates(messages),
      threads: extractThreadSummaries(messages)
    };
  }

  return analysis;
}

function extractActionItems(messages) {
  const doc = nlp(messages.map(m => m.text).join('. '));
  return doc.verbs()
    .json()
    .filter(action => action.text.length > 3)
    .map(action => ({
      action: action.text,
      context: findContext(messages, action.text),
      thread: findThreadContext(messages, action.text)
    }));
}

function extractKeyTopics(messages) {
  const doc = nlp(messages.map(m => m.text).join('. '));
  return [...new Set(
    doc.nouns()
      .json()
      .filter(topic => topic.text.length > 3)
      .map(topic => topic.text)
  )];
}

function identifyHurdles(messages) {
  const hurdles = messages.filter(msg => {
    const text = msg.text.toLowerCase();
    return text.includes('bug') || 
           text.includes('issue') || 
           text.includes('fix') || 
           text.includes('problem') ||
           text.includes('blocker');
  });
  
  return hurdles.map(h => ({
    issue: h.text,
    reporter: h.user,
    timestamp: h.timestamp,
    thread: h.isThreadParent ? null : {
      parentMessage: h.parentText,
      threadTs: h.threadTs
    }
  }));
}

function identifyDecisions(messages) {
  const decisions = messages.filter(msg => {
    const text = msg.text.toLowerCase();
    return text.includes('decided') || 
           text.includes('agreed') || 
           text.includes('conclusion') ||
           text.includes('will be');
  });
  
  return decisions.map(d => ({
    decision: d.text,
    by: d.user,
    timestamp: d.timestamp,
    thread: d.isThreadParent ? null : {
      parentMessage: d.parentText,
      threadTs: d.threadTs
    }
  }));
}

function identifyUpdates(messages) {
  const updates = messages.filter(msg => {
    const text = msg.text.toLowerCase();
    return text.includes('completed') || 
           text.includes('finished') || 
           text.includes('deployed') ||
           text.includes('implemented');
  });
  
  return updates.map(u => ({
    update: u.text,
    by: u.user,
    timestamp: u.timestamp,
    thread: u.isThreadParent ? null : {
      parentMessage: u.parentText,
      threadTs: u.threadTs
    }
  }));
}

function extractThreadSummaries(messages) {
  // Group messages by thread
  const threads = messages.reduce((acc, msg) => {
    if (msg.threadTs && !msg.isThreadParent) {
      if (!acc[msg.threadTs]) {
        acc[msg.threadTs] = {
          parentMessage: msg.parentText,
          replies: []
        };
      }
      acc[msg.threadTs].replies.push(msg);
    }
    return acc;
  }, {});

  // Summarize each thread
  return Object.entries(threads)
    .filter(([_, thread]) => thread.replies.length > 0)
    .map(([threadTs, thread]) => ({
      topic: thread.parentMessage,
      messageCount: thread.replies.length,
      participants: [...new Set(thread.replies.map(r => r.user))],
      key_points: summarizeThreadPoints(thread.replies)
    }));
}

function summarizeThreadPoints(replies) {
  const combinedText = replies.map(r => r.text).join('. ');
  const doc = nlp(combinedText);
  
  return {
    topics: [...new Set(doc.nouns().out('array'))].slice(0, 3),
    decisions: replies.filter(r => 
      r.text.toLowerCase().includes('decided') || 
      r.text.toLowerCase().includes('agreed')
    ).map(r => r.text),
    actions: doc.verbs().out('array').slice(0, 3)
  };
}

function findContext(messages, keyword) {
  const relevantMessage = messages.find(msg => 
    msg.text.toLowerCase().includes(keyword.toLowerCase())
  );
  return relevantMessage ? relevantMessage.text : '';
}

function findThreadContext(messages, keyword) {
  const relevantMessage = messages.find(msg => 
    msg.text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (!relevantMessage || relevantMessage.isThreadParent) {
    return null;
  }

  return {
    parentMessage: relevantMessage.parentText,
    threadTs: relevantMessage.threadTs
  };
}