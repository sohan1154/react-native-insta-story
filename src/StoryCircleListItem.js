import React, { Component } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { s, vs, ms, mvs } from 'react-native-size-matters';


// Constants
import DEFAULT_AVATAR from "./assets/images/no_avatar.png";

// Components
class StoryCircleListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPressed: this.props?.item?.seen
        };
    }

    // Component Functions
    _handleItemPress = item => {

        // console.log('item:::::::', item)
        const { handleStoryItemPress, storySeen } = this.props;

        if (handleStoryItemPress) handleStoryItemPress(item);

        this.setState({ isPressed: true });
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.item.seen != this.props.item.seen) {
            this.setState({ isPressed: this.props.item.seen });
        }
    }

    render() {
        // console.log('item:::::::::::::', this.props.item)
        // console.log('index:::::::::::::', this.props.index)
        const { item, unPressedBorderColor, pressedBorderColor, avatarSize, theme } = this.props;
        const { isPressed } = this.state;
        return (
            <View style={styles.container}>

                {!this.props.index &&
                    <>
                        <TouchableOpacity style={styles.userStoryStyle} onPress={() => item.onPress()}>
                            <Image source={item.storyImage} style={styles.userStoryImage} />
                        </TouchableOpacity>
                        <Text style={{ color: (theme === 'dark') ? '#FFF' : '#000', alignSelf: 'center' }}>{item.user_name.length < 10 ? item.user_name : item.user_name.slice(0, 7) + '...'}</Text>

                    </>
                }

                {this.props.index > 0 &&
                    <>
                        <TouchableOpacity
                            onPress={() => this._handleItemPress(item)}
                            style={[
                                styles.avatarWrapper,
                                {
                                    height: avatarSize ? avatarSize + 4 : 64,
                                    width: avatarSize ? avatarSize + 4 : 64,
                                },
                                !isPressed
                                    ? {
                                        borderColor: unPressedBorderColor
                                            ? unPressedBorderColor
                                            : 'red'
                                    }
                                    : {
                                        borderColor: pressedBorderColor
                                            ? pressedBorderColor
                                            : 'grey'
                                    }
                            ]}
                        >
                            {!isPressed ?
                                <LinearGradient
                                    colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
                                    style={{
                                        alignItems: 'center',
                                        padding: 3,
                                        borderRadius: 100
                                    }}
                                    start={{ x: 0, y: 1 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {item.user_image !== null ?
                                        <Image
                                            style={{
                                                height: avatarSize ?? 60,
                                                width: avatarSize ?? 60,
                                                borderRadius: 100,
                                            }}
                                            source={{ uri: item.user_image }}
                                            defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                                        />
                                        :
                                        <Image
                                            style={{
                                                height: avatarSize ?? 60,
                                                width: avatarSize ?? 60,
                                                borderRadius: 100,
                                            }}
                                            source={require('./assets/images/no_avatar.png')}
                                            defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                                        />
                                    }
                                </LinearGradient>
                                :
                                <>
                                {   
                                    item.user_image !== null ?
                                        <Image
                                            style={{
                                                height: avatarSize ?? 60,
                                                width: avatarSize ?? 60,
                                                borderRadius: 100,
                                            }}
                                            source={{ uri: item.user_image }}
                                            defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                                        />
                                        :
                                        <Image
                                            style={{
                                                height: avatarSize ?? 60,
                                                width: avatarSize ?? 60,
                                                borderRadius: 100,
                                            }}
                                            source={require('./assets/images/no_avatar.png')}
                                            defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                                        />
                                    }
                                    </>
                            }
                        </TouchableOpacity>
                        <Text style={{ color: (theme === 'dark') ? '#FFF' : '#000', alignSelf: 'center' }}>{item.user_name.length < 10 ? item.user_name : item.user_name.slice(0, 7) + '...'}</Text>
                    </>
                }
            </View>
        );
    }
}

export default StoryCircleListItem;

const
    styles = StyleSheet.create({
        container: {
            marginVertical: 5,
            marginHorizontal: 8
        },
        unPressedAvatar: {
            borderColor: 'red'
        },
        pressedAvatar: {
            borderColor: 'grey'
        },
        avatarWrapper: {
            borderWidth: 2,
            justifyContent: "center",
            alignItems: "center",
            borderColor: 'red',
            borderRadius: 100,
            height: 64,
            width: 64
        },
        avatar: {
            height: 60,
            width: 60,
            borderRadius: 100,
        },
        itemText: {
            textAlign: "center",
            fontSize: 9
        },
        userStoryImage: {
            alignSelf: 'center',
            borderRadius: s(100),
            height: s(51),
            width: s(51),
        },
    });
