const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, REST, Routes, EmbedBuilder, Collection } = require('discord.js');

let configFile = JSON.parse(fs.readFileSync('secrets_5XB.json', 'utf8'));

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
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

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
});

client.on('guildMemberAdd', async member => {
	const mod_embed = new EmbedBuilder()
		.setColor(0xFF0000)
		.setTimestamp()
		.addFields({name: `New Member Joined!`, value: member.tag});

	let channel = client.channels.cache.find(ch => ch.name === configFile.log_chan);
	channel.send({ embeds: [mod_embed] });
});

client.on('messageDelete', async message => {
    try {
        if (message.author.bot) return;
        if (message.content === '') return;

		const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: message.author.tag})
			.setTimestamp()
            .addFields({name: `Message from ${message.member.nickname} deleted in <#${message.channel.id}>`, value: message.content});

		let channel = client.channels.cache.find(ch => ch.name === configFile.log_chan);
        channel.send({ embeds: [embed] });
    } catch (e) {
        console.error(e);
    }
});

client.login(configFile.token).catch(function() {
    console.error('Login failed. The token that you put in is most likely invalid.');
    process.exit(1);
});