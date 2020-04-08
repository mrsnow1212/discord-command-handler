
let log = console.log;
require('dotenv').config()
const chalk = require('chalk');
const fetch = require('node-fetch')
//const { prefix } = require('./config');
const database = require('./data/database')
const prefix = ["trump","t."];
const { Client, Collection } = require("discord.js");
const { readdir, lstatSync } = require("fs");
const client = new Client();

client.cmds = new Collection();
client.aliases = new Collection();

client.on("ready", async () => {
log(chalk.green('[')+chalk.red.bold("MAIN")+chalk.green('] ')+chalk.red.bold(client.user.tag)+chalk.yellow(" está online!"));

});

const carregarComandos = (
  module.exports.carregarComandos = (
  dir = "./comandos/"
) => {
  readdir(dir, (erro, arquivos) => {
    if (erro) return console.log(erro);
    arquivos.forEach(arquivo => {
      try {
        if (lstatSync(`./${dir}/${arquivo}`).isDirectory()) {
          carregarComandos(`./${dir}/${arquivo}`);
        } else if (arquivo.endsWith(".js")) {
          console.log(chalk.green('[')+chalk.blue.bold("CMD")+chalk.green('] ')+chalk.yellow(`Iniciando leitura do arquivo: ${arquivo.split(".")[0]}`));
          const salvar = (nome, aliases = [], props) => {
            client.cmds.set(nome, props);
            if (aliases.length > 0)
              aliases.forEach(alias => client.aliases.set(alias, props));
            log(chalk.green('[')+chalk.blue.bold("CMD")+chalk.green('] ')+chalk.yellow(`Comando salvo: ${chalk.blue(`${nome}`)} | ${chalk.blue(`${aliases.length}`)} aliases\n==========================`));
          };
          const props = require(`./${dir}/${arquivo}`);
          if (!props.run) {
            log(chalk.green('[')+chalk.blue.bold("CMD")+chalk.green('] ')+chalk.yellow(`Não existe uma função que ative o comando no arquivo: ${chalk.blue(`${arquivo.split(".")[0]}`)}. Então ele foi ignorado`));
            return;
          }

          if (props.info && props.info.name) {
            const nome = props.info.name;
            const aliases = props.info.aliases || [];
            salvar(nome, aliases, props);
          } else {
            const propsKeys = Object.keys(props);
            if (!propsKeys) {
              console.log(chalk.green('[')+chalk.blue.bold("CMD")+chalk.green('] ')+chalk.yellow(`Não existem propriedades no arquivo: ${chalk.blue(`${arquivo.split(".")[0]}`)}. Então ele foi ignorado.`));
              return;
            }
            const nomeKey = propsKeys.find(key => props[key] && (props[key].name || props[key].nome));
            if (!nomeKey) {
              console.log(chalk.green('[')+chalk.blue.bold("CMD")+chalk.green('] ')+chalk.yellow(`Não existe a propiedade que remeta ao nome do comando no arquivo: ${chalk.blue(`${arquivo.split(".")[0]}`)}. Então ele foi ignorado.`));
              return;
            }

            const nome = props[nomeKey].name || props[nomeKey].nome;
            const aliases = props[nomeKey].aliases || [];
            salvar(nome, aliases, props);
          }
        }
      } catch (ex) {
        log(chalk.green('[')+chalk.blue.bold("FILES")+chalk.green('] ')+chalk.yellow(`Erro ao ler o arquivo ${chalk.blue(`${arquivo}`)}`));
        log(ex);
      }
    });
  });
});
carregarComandos();

/*
Todo arquivo de comando deve seguir o seguinte padrão:
module.exports.run = (client, message, args) => {
~ código do comando aqui ~
}
module.exports.info = {
    name: "nome do comando",
    aliases: ["outro meio de chamar o comando"] -- essa parte é opcional
}
*/
client.on("message", async message => {

  if (message.author.bot) return;
  if (message.channel.type != "text") return; // opcional: vai ignorar todos os comandos que não forem executados em canais de texto
  if (message.content.indexOf(prefix) !== 0) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  
  const cmdParaExecutar = client.cmds.get(cmd) || client.aliases.get(cmd);
  if (cmdParaExecutar != null) cmdParaExecutar.run(client, message, args);

});

client.login(process.env.TOKEN);
