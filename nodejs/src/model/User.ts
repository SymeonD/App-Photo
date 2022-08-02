export class User{
    _id_user : string;
    _mail_user : string;
    _password_user : string;
    _pseudo_user : string;
    _profile_picture_user : string;
    _description_user : string;
    constructor(id : string, mail: string,password :string,pseudo :string,profile_picture_user:string,description_user:string){
        this._id_user = id;
        this._mail_user = mail;
        this._password_user = password;
        this._pseudo_user = pseudo;
        this._profile_picture_user = profile_picture_user;
        this._description_user = description_user;
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

    get profile_picture(): string{
        return this._profile_picture_user;
    }

    get description(): string{
        return this._description_user;
    }
}
