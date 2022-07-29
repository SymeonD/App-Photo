import { get } from 'express/lib/response';
import React from 'react';
import { FlatList, SectionList, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react/cjs/react.production.min';

const styles = StyleSheet.create({
    container: {
     flex: 1,
     paddingTop: 22
    },
    sectionHeader: {
      paddingTop: 2,
      paddingLeft: 10,
      paddingRight: 10,
      paddingBottom: 2,
      fontSize: 14,
      fontWeight: 'bold',
      backgroundColor: 'rgba(247,247,247,1.0)',
    },
    item: {
      padding: 10,
      fontSize: 18,
      height: 44,
    },
})

export const getUsers = async() => {
    try {
        const response = await fetch(
            'http://192.168.1.196/users', {
            method:"GET",
            }
        );
        const json = await response.json();
        var users = [];
        for(var i of json){
            users.push(i._pseudo_user);
        }
        console.log("Fonctions : "+users);
        return (users);
    } catch (error) {
        console.error(error);
    }
}

const SectionListBasics = (dataUser) => {
    //var users = await getUsers();
    //console.log("Section:"+users);
    return (
        <View style={styles.container}>
            <SectionList
                sections={[
                    {title:"D", data: ['syms']},
                    {title:'J', data: ['Jackson', 'James', 'Jillian', 'Jimmy', 'Joel', 'John', 'Julie']},
                ]}
                renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                keyExtractor={(item, index) => 'basicListEntry-${item.title}'}
            />
        </View>
    );
}

export default SectionListBasics;