import Bot from "./Client" 

export default class MessageParser {
    static onMessage(client: Bot) {
        return function(message: string|{[key: string]: any}|any) {
            message = JSON.parse(message.data)
            switch (message.type) {
                case "message_list":
                    break
                case "chat_list":
                    break
                case "message":
                    let onMessage = client.botCallbacks?.onMessage
                    if (onMessage) {
                        onMessage(message)
                    }
                case "error":
                    if (message.error == "message_rate_limit") {
                        let onError = client.botCallbacks?.onRateLimit
                        if (onError) {
                            onError(message)
                        }
                    } else {
                        let onError = client.botCallbacks?.onError
                        if (onError) {
                            onError(message)
                        }
                    }
                case "connection_error":
                    let onConnectionError = client.botCallbacks?.onConnectionError
                    if (onConnectionError) {
                        onConnectionError(message)
                    }
                case "file":
                    let onFile = client.botCallbacks?.onFile
                    if (onFile) {
                        onFile(message)
                    }
            }
        }
    }
}