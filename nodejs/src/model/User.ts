export class User{
    _id_user : string;
    _mail_user : string;
    _password_user : string;
    _pseudo_user : string;
    constructor(id : string, mail: string,password :string,pseudo :string){
        this._id_user = id;
        this._mail_user = mail;
        this._password_user = password;
        this._pseudo_user = pseudo;
    }
    get id(): string {
        return this._id_user;
    }

    get mail(): string{
        return this._mail_user;
    }

    get password(): string{
        return this._password_user;
    }
    
    get pseudo(): string {
        return this._pseudo_user;
    }
}
