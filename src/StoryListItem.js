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
    Keyboard,
    Alert
} from "react-native";
import Video from 'react-native-video';
import type { IUserStoryItem } from "./interfaces/IUserStory";
import { usePrevious } from "./helpers/StateHelpers";
import { s } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/AntDesign';
import { isNullOrWhitespace } from "./helpers/ValidationHelpers";
import GestureRecognizer from 'react-native-swipe-gestures';
import { ScrollView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

type Props = {
    currentUserId: string,
    userID: string,
    profileName: string,
    profileImage: string,
    duration?: number,
    onFinish?: function,
    resetIsInputBox?: function,
    onClosePress: function,
    key: number,
    swipeText?: string,
    handleDeleteStory?: any,
    customSwipeUpComponent?: any,
    isInputBox: string,
    customKeyboardPopup?: any,
    customCloseComponent?: any,
    stories: IUserStoryItem[]
};

export const StoryListItem = (props: Props) => {

    const stories = props.stories;
    // console.log('stories::::::::::', stories)

    const [end, setEnd] = useState(0);
    const [load, setLoad] = useState(true);
    const [pressed, setPressed] = useState(false);
    const [isPaused, setIsPaused] = useState(true); // false
    const [isMuted, setIsMuted] = useState(true);
    const [duration, setDuration] = useState(false);
    const [showInputBox, setShowInputBox] = useState(false);
    const [current, setCurrent] = useState(0);
    const [content, setContent] = useState(
        stories.map((x) => {
            return {
                story_id: x.story_id,
                image: x.story_image,
                type: x.type,
                onPress: x.onPress,
                finish: 0
            }
        })
    );
    const prevCurrent = usePrevious(current);
    const progress = useRef(new Animated.Value(0)).current;
    let timeOut = null;

    useEffect(() => {
        console.log('props.currentPage:::', props.currentPage)
        console.log('props.index:::', props.index)
        // console.log('content::::::::::::::', content[0])
        console.log('timeOut::::::::::::::', timeOut)

        if (timeOut) {
            clearTimeout(timeOut);
            console.log('timeout is cleared')
        }

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

        if (props.isInputBox === true) {
            resumeAnimationOnSubmit()
        }

    }, [props.isInputBox])

    useEffect(() => {

        console.log('isPaused use effect')
        if (props.index == props.currentPage && content[current].type == 'video') {

            console.log('isPaused use effect condition matched')
            // startAnimation();
        }

    }, [isPaused])


    useEffect(() => {

        if (!isNullOrWhitespace(prevCurrent)) {
            if (current > prevCurrent && content[current - 1].image == content[current].image) {
                console.log('currentPage:::', props.currentPage)
                start();

            } else if (current < prevCurrent && content[current + 1].image == content[current].image) {
                console.log('currentPage:::', props.currentPage)
                start();
            }
        }
    }, [current]);

    function start(duration) {
        setDuration(duration)
        setLoad(false);
        progress.setValue(0);
        startAnimation(duration);
    }

    function startAnimation(duration) {

        // console.log('content[current]:::::::::',content[current])

        // console.log('current--------------->', current)
        // console.log('content--------------->', content)

        // checking if the data type is video or image
        if (props.index == props.currentPage) {

            if (content[current].type == 'video') {

                setIsPaused(false);

                let videoLenth = (typeof duration !== 'undefined') ? duration : end;

                console.log('Video Lenth is:', videoLenth, ' in duration is:', duration, ' or end is:', end)

                // type videos
                Animated.timing(progress, {
                    toValue: 1,
                    duration: videoLenth * 1000, // duration  // end,
                    useNativeDriver: false,
                }).start(({ finished }) => {

                    console.log('video-----finished:::', finished)
                    if (finished) {
                        next();
                    }
                    else if (!finished) {

                        console.log('set time out is calling...')

                        timeOut = setTimeout(() => {
                            console.log('Your time is finished')
                            next()
                        }, videoLenth * 1000);

                        console.log('timeOut::::::::::::::', timeOut)
                    }
                });
            } else {
                // type image
                Animated.timing(progress, {
                    toValue: 1,
                    duration: props.duration,
                    useNativeDriver: false,

                }).start(({ finished }) => {
                    console.log('image-----finished::::', finished)
                    if (finished) {
                        next();
                    }
                });
            }
        }
    }

    function onSwipeUp() {
        progress.stopAnimation();
        setPressed(true);
        setShowInputBox(true);
    }

    function confirmDeleteBox(storyID) {
        progress.stopAnimation();
        setPressed(true);

        Alert.alert(
            "Are you sure want to Delete?",
            '',
            [
                {
                    text: "Cancel",
                    onPress: () => resumeAnimation(),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => {
                        updateStories(storyID);
                        props.handleDeleteStory(storyID);
                    }
                }
            ]
        );
    }

    function updateStories(storyID) {
        let updatedStories = content.filter(item => item.story_id !== storyID);
        
        // console.log('updatedStories:::::',updatedStories);

        if(typeof updatedStories !== 'undefined' && updatedStories.length > 0 && typeof updatedStories[current] !== 'undefined') {
            setContent(updatedStories);

        } else {
            // setContent(updatedStories);
            next();
            // setTimeout(() => {
            //     setContent(updatedStories);
            // }, 1000);
        }
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
        console.log('duration::::::', duration)
        startAnimation(duration);
        setPressed(false);
        setShowInputBox(false);
        setIsPaused(false)
        Keyboard.dismiss()
        // console.log('progress::::::', progress)
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

    const handleStopAnimation = () => {

        progress.stopAnimation()
        setIsPaused(true)
        // console.log('progress::::::', progress)

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
                <View style={styles.backgroundContainer}>

                    {/* check the data type is video or an image */}

                    {/* { console.log('file-type is:', content[current].type)} */}

                    {content[current].type == 'video' ? (
                        <>
                            <Video
                                source={{
                                    uri: content[current].image,
                                }}
                                resizeMode="cover"
                                paused={isPaused}
                                // muted={isMuted}
                                onLoad={({ duration }) => {
                                    console.log('Video onLoad :::::: and duration is:::', duration)

                                    setEnd(duration);

                                    if (props.index == props.currentPage) {
                                        start(duration)
                                    }
                                }}
                                style={{ height: height, width: width }}
                            />
                        </>
                    ) : (

                            <Image onLoadEnd={() => {
                                console.log('Image onLoadEnd ::::::')
                                start()
                            }}
                                source={{ uri: content[current].image }}
                                style={styles.image}
                            />
                        )}

                    {load && <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color={'white'} />
                    </View>}
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
                                    <Icon size={22} color='#FFF' name="closecircleo" />
                                }
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pressContainer}>

                        <TouchableWithoutFeedback
                            onPressIn={() => handleStopAnimation()}
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
                        <TouchableWithoutFeedback onPressIn={() => handleStopAnimation()}
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

                {props.userID == props.currentUserId ?
                    <TouchableOpacity activeOpacity={1}
                        onPress={() => confirmDeleteBox(content[current].story_id)}
                        style={styles.swipeUpBtn}
                    >
                        <View style={{ marginTop: s(28) }}>
                            <Text style={styles.replyText}>Delete</Text>
                        </View>
                    </TouchableOpacity>
                    :
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
                }
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
        paddingTop: Platform.OS === 'ios' ? 40 : 10,
        paddingHorizontal: 10,
        // marginTop: Platform.OS === 'ios' ? 30 : 0
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
