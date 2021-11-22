import { AxiosRequestConfig } from "axios"

const axios = require("axios")

interface BotOpts {
    email?: string
    password?: string
    prefix: string
    apikey: string
    region: string
}

class iFunnyApi {
    static request(url: string, opts?: AxiosRequestConfig) {
        return new Promise(function(resolve, reject) {
            axios({baseURL: "https://api.ifunny.chat", url: url, ...opts})
            .then((data: any) => resolve(data))
            .catch((data: any) => resolve(data.toJSON()))
        })
    }
}

class Bot {
    private host: string = "https://api.ifunny.chat"
    private email?: string
    private password?: string
    private bearertoken?: string
    private apikey?: string
    private region: string

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

    request(url: string, opts: AxiosRequestConfig) {
        if (opts.data) {
            opts.data.apikey = this.apikey
        } else {
            opts.data = { apikey: this.apikey }
        }
        return new Promise((resolve, reject) => {
            axios({baseURL: this.host, url: url, ...opts})
            .then((data: any) => resolve(data.data))
            .catch((data: any) => resolve(data.data))
        })
    }
}

async function run() {
    var bot = new Bot({email: "etobibillingsley@gmail.com", password: "Lilipup16.", region: "United States", prefix: "!", apikey: "577a3d3a490f76b6a913ff8b6758c87f"})
    console.log((await bot.bearer))
}

run()