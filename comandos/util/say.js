exports.run = async (client, message, args) => {

if (!args[0]) return message.reply('Digite algo!');

message.delete();
message.channel.send(args.join(" "));

}
exports.info = {
name: "say",
aliases: ["falar"]
}
