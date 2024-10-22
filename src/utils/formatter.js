export function formatSummary(analysis) {
  let summary = '';

  for (const [date, data] of Object.entries(analysis)) {
    summary += `\n📅 Summary for ${date}:\n`;
    summary += '================================\n';

    if (data.actionItems.length > 0) {
      summary += '\n🎯 Action Items:\n';
      data.actionItems.forEach(item => {
        summary += `- ${item.action}\n`;
        if (item.context) summary += `  Context: ${item.context}\n`;
        if (item.thread) {
          summary += `  Thread: Re: "${item.thread.parentMessage}"\n`;
        }
      });
    }

    if (data.keyTopics.length > 0) {
      summary += '\n🔑 Key Topics:\n';
      data.keyTopics.forEach(topic => {
        summary += `- ${topic}\n`;
      });
    }

    if (data.hurdles.length > 0) {
      summary += '\n⚠️ Hurdles & Issues:\n';
      data.hurdles.forEach(hurdle => {
        summary += `- ${hurdle.issue} (reported by ${hurdle.reporter})\n`;
        if (hurdle.thread) {
          summary += `  Thread: Re: "${hurdle.thread.parentMessage}"\n`;
        }
      });
    }

    if (data.decisions.length > 0) {
      summary += '\n✅ Decisions Made:\n';
      data.decisions.forEach(decision => {
        summary += `- ${decision.decision} (by ${decision.by})\n`;
        if (decision.thread) {
          summary += `  Thread: Re: "${decision.thread.parentMessage}"\n`;
        }
      });
    }

    if (data.updates.length > 0) {
      summary += '\n📈 Progress Updates:\n';
      data.updates.forEach(update => {
        summary += `- ${update.update} (by ${update.by})\n`;
        if (update.thread) {
          summary += `  Thread: Re: "${update.thread.parentMessage}"\n`;
        }
      });
    }

    if (data.threads.length > 0) {
      summary += '\n🧵 Key Discussions:\n';
      data.threads.forEach(thread => {
        summary += `\nTopic: "${thread.topic}"\n`;
        summary += `Participants: ${thread.participants.length} people\n`;
        
        if (thread.key_points.decisions.length > 0) {
          summary += 'Decisions:\n';
          thread.key_points.decisions.forEach(d => summary += `- ${d}\n`);
        }
        
        if (thread.key_points.topics.length > 0) {
          summary += 'Main points discussed:\n';
          thread.key_points.topics.forEach(t => summary += `- ${t}\n`);
        }
      });
    }

    summary += '\n';
  }

  return summary;
}