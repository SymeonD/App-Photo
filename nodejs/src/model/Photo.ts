export class Photo{
    _id_photo : string;
    _id_post : string;
    _link_photo : string;

    constructor(id : string, id_post: string, link : string){
        this._id_photo = id;
        this._id_post = id_post;
        this._link_photo = link;
    }

    get id(): string {
        return this._id_photo;
    }

    get id_post(): string {
        return this._id_post;
    }

    get link(): string{
        return this._link_photo;
    }
}