export interface IOutMessage {
    msg_type: string
    cmd: string
    from: string
    msg?: string
    data?: any
}

export function validateMsg(msg: any): boolean {
    return true;
}