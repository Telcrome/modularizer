export interface IOutMessage {
    msg_type: string
    cmd: string
    from: string
    msg?: string
    data?: any
}