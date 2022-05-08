import React,{Component} from 'react';
import { Text, View, StyleSheet } from 'react-native';

import {NavigationContainer} from '@react-navigation/native'
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import SearchScreen from '../Screens/search';
import TransitionScreen from '../Screens/transaction';

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default class BottonTabNavigator extends Component{
  render(){
    return(
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              var iconName;
              if(route.name==='Transición'){
                iconName='home'
              }else if(route.name ==='Busqueda'){
                iconName='search'
              }

              return(<Ionicons name={iconName} size={size} color={color} />)
            }
          })}

          tabBarOptions={{
            activeTintColor:'purple',
            inactiveTintColor:'black'
          }}

        >
          <Tab.Screen name="Transición" component={TransitionScreen} />
          <Tab.Screen name="Busqueda" component={SearchScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}