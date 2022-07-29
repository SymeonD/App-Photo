create table if not exists users(
    id_user UUID unique default gen_random_uuid(),
    mail_user varchar unique,
    password_user varchar,
    pseudo_user varchar unique
);

create table if not exists posts(
    id_post UUID unique default gen_random_uuid(),
    description_post text,
    id_user UUID references users(id_user),
    localisation_post varchar,
    date_post date     
);

create table if not exists photos(
    id_photo UUID unique default gen_random_uuid(),
    id_post UUID references posts(id_post),
    link_photo varchar
);