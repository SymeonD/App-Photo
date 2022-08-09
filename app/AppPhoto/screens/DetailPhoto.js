import React, { useState } from "react";
import { View, Image} from "react-native";



const DetailPhoto = ({route, navigation}) => {
    const [photo, setPhoto] = useState(route.params.data);
    const dataUser = route.params.user;

    return (
        <View>
            <Image
                source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+photo._link_photo}}
                style={{width:'100%', aspectRatio:1}}
            />
        </View>
    );
}

export default DetailPhoto;