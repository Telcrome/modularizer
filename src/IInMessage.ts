export interface IInMessage {
    msg_type: string
    cmd: string
    to: string
    msg?: string
    data?: any
}