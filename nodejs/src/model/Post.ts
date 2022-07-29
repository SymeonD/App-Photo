export class Post{
    _id_post : string;
    _description_post : string;
    _id_user : string;
    _localisation_post : string;
    _date_post : Date;

    constructor(id : string, description : string, user : string, localisation : string, date : Date){
        this._id_post = id;
        this._description_post = description;
        this._id_user = user;
        this._localisation_post = localisation;
        this._date_post = date;
    }

    get id(): string {
        return this._id_post;
    }
    get description(): string{
        return this._description_post;
    }
    get user(): string{
        return this._id_user;
    }
    get localisation(): string {
        return this._localisation_post;
    }
}