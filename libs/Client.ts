import { AxiosRequestConfig } from "axios"
import MessageParser from "./MessageHandler"
import ws from "ws"

const axios = require("axios")

interface BotOpts {
    email?: string
    password?: string
    prefix: string
    apikey: string
    region: string
}


class Bot {
    private host: string = "api.ifunny.chat"
    private email?: string
    private password?: string
    private bearertoken?: string
    private apikey?: string
    private region: string
    private websocketCallbacks: {[key: number]: any} = {}
    public botCallbacks: {[key: string]: any} = {}
    public ws?: ws


    constructor(opts: BotOpts) {
        this.email = opts.email
        this.password = opts.password
        this.apikey = opts.apikey
        this.region = opts.region
    }
    
    get bearer() {
        return new Promise(async (resolve, reject) => {
            if (this.bearertoken) { resolve(this.bearertoken) }
            else {
                var data: any = await this.request("/login", { method: "POST", data: { email: this.email, password: this.password, region: this.region }})
                if (data.error) {
                    //handle errors
                    console.log(data)
                    reject("Error logging in")

                } else {
                    if (data.bearer) {
                        this.bearertoken = data.bearer
                        resolve(this.bearertoken)
                    }
                }
            }
        })
    }

    connect() {
        return new Promise(async (resolve, reject) => {
            this.ws = new ws(`wss://${this.host}/ws/${await this.bearer}`)
            this.ws.onmessage = MessageParser.onMessage(this)
        })
    }

    onMessage(fn: (message: {[key: string]: any}) => void) {
        this.botCallbacks["onMessage"] = fn
    }

    onCaptcha(fn: (captchaUrl: string) => boolean) { //Move to electron
        this.botCallbacks["onCaptcha"] = fn
    }

    onError(fn: (error: string) => void) {
        this.botCallbacks["onErrror"] = fn
    }

    onConnectionError(fn: (reason: string) => void) { //Move to bot side
        this.botCallbacks["onConnectionError"] = fn
    }

    onRateLimit(fn: () => void) { //Movie to bot side
        this.botCallbacks["onRateLimit"] = fn
    }

    onFile(fn: (fileInformation: {[key: string]: any}) => void) {
        this.botCallbacks["onFile"] = fn
    }

    request(url: string, opts?: AxiosRequestConfig) {
        if (!opts) {
            opts = {}
        }
        if (opts.data) {
            opts.data.apikey = this.apikey
        } else {
            opts.data = { apikey: this.apikey }
        }
        return new Promise((resolve, reject) => {
            axios({baseURL: `https://${this.host}`, url: url, ...opts})
            .then((data: any) => resolve(data.data))
            .catch((data: any) => resolve(data.data))
        })
    }

    userById(id: string) {
        return new Promise(async (resolve, reject) => {
            let data = await this.request("/user/" + id)
            // Add error handling
            resolve(data)
        })
    } 

    userByNick(nick: string) {
        return new Promise(async (resolve, reject) => {
            let data = await this.request("/user_by_nick/" + nick)
            resolve(data)
        })
    }

    getBotAccountData() {
        return new Promise(async (resolve, reject) => {
            let data = await this.request(`/account?bearer=${await this.bearer}`)
            resolve(data)
        })
    }

}

export default Bot

async function run() {
    var bot = new Bot({email: "@gmail.com", password: "", region: "United States", prefix: "!", apikey: ""})
    console.log((await bot.bearer))
    bot.onMessage((message) => {
        console.log(message)
    })
    bot.connect()
}

run()