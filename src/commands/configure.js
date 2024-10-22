import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { setChannelConfig } from '../config/channelConfig.js';

yargs(hideBin(process.argv))
  .command('$0', 'Configure channel to document mapping', {
    channel: {
      alias: 'c',
      describe: 'Slack channel ID',
      demandOption: true,
      type: 'string'
    },
    doc: {
      alias: 'd',
      describe: 'Google Doc ID',
      demandOption: true,
      type: 'string'
    },
    frequency: {
      alias: 'f',
      describe: 'Update frequency',
      choices: ['daily', 'weekly'],
      default: 'daily'
    }
  }, (argv) => {
    setChannelConfig(argv.channel, argv.doc, argv.frequency);
    console.log(`✅ Configuration saved for channel ${argv.channel}`);
    console.log(`📝 Updates will be written to document: ${argv.doc}`);
    console.log(`⏰ Update frequency: ${argv.frequency}`);
  })
  .help()
  .argv;