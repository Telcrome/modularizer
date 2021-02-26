export interface IInMessage {
    msg_type: string
    cmd: string
    to: string
    msg?: string
    data?: any
}

export function validateMsg(msg: any): boolean {
    if (!("msg_type" in msg)) {
        return false;
    }

    return true;
}
