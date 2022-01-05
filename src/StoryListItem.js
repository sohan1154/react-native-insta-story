import React, { useState, useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    ActivityIndicator,
    KeyboardAvoidingView,
    View,
    Platform,
    Keyboard
} from "react-native";
import Video from 'react-native-video';
import type { IUserStoryItem } from "./interfaces/IUserStory";
import { usePrevious } from "./helpers/StateHelpers";
import { s } from 'react-native-size-matters';
import { isNullOrWhitespace } from "./helpers/ValidationHelpers";
import GestureRecognizer from 'react-native-swipe-gestures';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type Props = {
    profileName: string,
    profileImage: string,
    duration?: number,
    onFinish?: function,
    resetIsInputBox?: function,
    onClosePress: function,
    key: number,
    swipeText?: string,
    customSwipeUpComponent?: any,
    isInputBox: string,
    customKeyboardPopup?: any,
    customCloseComponent?: any,
    stories: IUserStoryItem[]
};

export const StoryListItem = (props: Props) => {
    const stories = props.stories;

    const [end, setEnd] = useState(0);
    const [load, setLoad] = useState(true);
    const [pressed, setPressed] = useState(false);
    const [showInputBox, setShowInputBox] = useState(false);
    const [content, setContent] = useState(
        stories.map((x) => {
            return {
                image: x.story_image,
                type: x.type,
                onPress: x.onPress,
                finish: 0
            }
        }));

    const [current, setCurrent] = useState(0);

    const prevCurrent = usePrevious(current);

    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        console.log('props.currentPage:::', props.currentPage)

        setCurrent(0);
        if (props.currentPage != 0) {
            let data = [...content];
            data.map((x, i) => {
                x.finish = 0;
            })
            setContent(data)
            start();
        }
    }, [props.currentPage]);

    useEffect(() => {

        if(props.isInputBox === true)
        {
            resumeAnimationOnSubmit()
        }
        
    }, [props.isInputBox])


    useEffect(() => {
        if (!isNullOrWhitespace(prevCurrent)) {
            if (current > prevCurrent && content[current - 1].image == content[current].image) {
                start();
                console.log('currentPage:::', props.currentPage)

            } else if (current < prevCurrent && content[current + 1].image == content[current].image) {
                start();
                console.log('currentPage:::', props.currentPage)

            }
        }

    }, [current]);

    function start() {
        setLoad(false);
        progress.setValue(0);
        startAnimation();
    }

    function startAnimation() {

        // console.log('content[current]:::::::::',content[current])

        // checking if the data type is video or not
        if (content[current].type == 'video') {
            // type videos
            if (load) {
                Animated.timing(progress, {
                    toValue: 1,
                    duration: 10000, // end,
                    useNativeDriver: false,
                }).start(({ finished }) => {
                    if (finished) {
                        next();
                    }
                });
            }
        } else {
            // type image
            Animated.timing(progress, {
                toValue: 1,
                duration: props.duration,
                useNativeDriver: false,

            }).start(({ finished }) => {
                if (finished) {
                    next();
                }
            });
        }
    }

    function onSwipeUp() {
        progress.stopAnimation();
        setPressed(true);
        setShowInputBox(true);
    }

    function onSwipeDown() {
        props?.onClosePress();
    }

    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
    };

    function next() {
        // check if the next content is not empty
        setLoad(true);
        if (current !== content.length - 1) {
            let data = [...content];
            data[current].finish = 1;
            setContent(data);
            setCurrent(current + 1);
            progress.setValue(0);
        } else {
            // the next content is empty
            close('next');
        }
    }

    function previous() {
        // checking if the previous content is not empty
        setLoad(true);
        if (current - 1 >= 0) {
            let data = [...content];
            data[current].finish = 0;
            setContent(data);
            setCurrent(current - 1);
            progress.setValue(0);
        } else {
            // the previous content is empty
            close('previous');
        }
    }

    function close(state) {
        let data = [...content];
        data.map(x => x.finish = 0);
        setContent(data);
        progress.setValue(0);
        if (props.currentPage == props.index) {
            if (props.onFinish) {
                props.onFinish(state);
            }
        }
    }

    const resumeAnimation = () => {
        
        setPressed(false);
        startAnimation();
        setShowInputBox(false);
        Keyboard.dismiss()
    }

    const resumeAnimationOnSubmit = () => {

        if (props.isInputBox) {
            props.resetIsInputBox(props.isInputBox)
        }
        setPressed(false);
        startAnimation();
        setShowInputBox(false);
        Keyboard.dismiss()
    }

    return (

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >

            <GestureRecognizer
                onSwipeUp={(state) => onSwipeUp(state)}
                onSwipeDown={(state) => onSwipeDown(state)}
                config={config}
                style={{
                    flex: 1,
                    // backgroundColor: 'red'
                }}
            >
                <SafeAreaView>
                <View style={styles.backgroundContainer}>

                    {/* check the data type is video or an image */}

                    {/* { console.log('file-type is:', content[current].type)} */}

                    {content[current].type == 'video' ? (
                        <>
                            {/* <Text style={{color: '#fff'}}>{content[current].image}</Text> */}
                            <Video
                                source={{
                                    uri: 'https://boppbucket.s3.us-east-2.amazonaws.com/uploads/test-videos/8.mp4',
                                }}
                                // rate={1.0}
                                // volume={1.0}
                                resizeMode="cover"
                                paused={false}
                                // positionMillis={0}
                                onReadyForDisplay={() => start()}
                                // onPlaybackStatusUpdate={AVPlaybackStatus => {
                                //     console.log(AVPlaybackStatus);
                                //     setLoad(AVPlaybackStatus.isLoaded);
                                //     setEnd(AVPlaybackStatus.durationMillis);
                                // }}
                                style={{ height: height, width: width }}
                            />
                        </>
                    ) : (

                        <Image onLoadEnd={() => start()}
                            source={{ uri: content[current].image }}
                            style={styles.image}
                        />
                    )}

                    {/* {load && <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color={'white'} />
                </View>} */}
                </View>

                <View style={{ flexDirection: 'column', flex: 1, }}>

                    <View style={styles.animationBarContainer}>
                        {content.map((index, key) => {
                            return (
                                <View key={key} style={styles.animationBackground}>
                                    <Animated.View
                                        style={{
                                            flex: current == key ? progress : content[key].finish,
                                            height: 2,
                                            backgroundColor: 'white',
                                        }}
                                    />
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.userContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={styles.avatarImage}
                                source={{ uri: props.profileImage }}
                            />
                            <Text style={styles.avatarText}>{props.profileName}</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            if (props.onClosePress) {
                                props.onClosePress();
                            }
                        }}>
                            <View style={styles.closeIconContainer}>
                                {props.customCloseComponent ?
                                    props.customCloseComponent :
                                    <Text style={{ color: 'white' }}>X</Text>
                                }
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pressContainer}>

                        <TouchableWithoutFeedback
                            onPressIn={() => progress.stopAnimation()}
                            onLongPress={() => setPressed(true)}
                            onPressOut={() => {
                                resumeAnimation()
                            }}
                            onPress={() => {
                                console.log('onPresssssssss')
                                if (!pressed && !load) {
                                    previous()
                                }

                            }}
                        >
                            <View style={{ flex: 1 }} />
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPressIn={() => progress.stopAnimation()}
                            onLongPress={() => setPressed(true)}
                            onPressOut={() => {
                                resumeAnimation()
                            }}
                            onPress={() => {
                                console.log('onPresssssssss')
                                if (!pressed && !load) {
                                    next()
                                }

                            }}>
                            <View style={{ flex: 1 }} />
                        </TouchableWithoutFeedback>
                    </View>
                </View>

                <TouchableOpacity activeOpacity={1}
                    onPress={onSwipeUp}
                    style={styles.swipeUpBtn}
                >
                    {showInputBox && props.customSwipeUpComponent ?
                        props.customSwipeUpComponent :

                        <View style={{ marginTop: s(15) }}>
                            <Text style={styles.replyText}>^</Text>
                            <Text style={styles.replyText}>Reply</Text>
                        </View>

                    }
                </TouchableOpacity>
                </SafeAreaView>
            </GestureRecognizer>
        </KeyboardAvoidingView >
    )
}


export default StoryListItem;

StoryListItem.defaultProps = {
    duration: 10000
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        width: width,
        height: height,
        resizeMode: 'cover'
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    spinnerContainer: {
        zIndex: -100,
        position: "absolute",
        justifyContent: 'center',
        backgroundColor: 'black',
        alignSelf: 'center',
        width: width,
        height: height,
    },
    animationBarContainer: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    animationBackground: {
        height: 2,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(117, 117, 117, 0.5)',
        marginHorizontal: 2,
    },
    userContainer: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    avatarImage: {
        height: 30,
        width: 30,
        borderRadius: 100
    },
    avatarText: {
        fontWeight: 'bold',
        color: 'white',
        paddingLeft: 10,
    },
    closeIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        paddingHorizontal: 15,
    },
    pressContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    swipeUpBtn: {
        position: 'absolute',
        alignItems: 'center',
        alignSelf: 'center',
        height: '10%',
        width: s(100),
        bottom: Platform.OS == 'ios' ? 20 : 50
    },
    replyText: {
        alignSelf: 'center',
        color: '#FFF',
        fontSize: s(12)
    },

});
