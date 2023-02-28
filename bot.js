const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, REST, Routes, EmbedBuilder, Collection } = require('discord.js');
const examQuestion = require('./scheduled_scripts/exam-question');
const roles = require('./scheduled_scripts/roles');

let configFile = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
	examQuestion.init(client, configFile);
	roles.init(client, configFile);
});

client.on(Events.InteractionCreate, async interaction => {
	if(interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else if(interaction.isButton()) {
		if(interaction.customId.includes('exam')) {
			examQuestion.answers(interaction);
		} else if(interaction.customId.includes('role')) {
			roles.update(interaction);
		}
	}

	
});

client.on('messageDelete', async message => {
    console.log('del');
    try {
        if (message.author.bot) return;
        if (message.content === '') return;
        let channel = client.channels.cache.find(ch => ch.name === configFile.log_chan);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(':wastebasket: Message Delete in #' + message.channel.name)
            .setAuthor({ name: message.author.username})
            .setDescription('Deleted on ' + new Date().toString())
            .addFields({name: 'Message content', value: '```' + message.content + '```'});
        channel.send({ embeds: [embed] });
    } catch (e) {
        console.error(e);
    }
});

client.login(configFile.token).catch(function() {
    console.error('Login failed. The token that you put in is most likely invalid.');
    process.exit(1);
});