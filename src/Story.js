import React, { Fragment, useRef, useState, useEffect } from "react";
import { LogBox, Dimensions, View, Platform } from "react-native";
import { s, vs, ms, mvs } from 'react-native-size-matters';
import Modal from "react-native-modalbox";
import StoryListItem from "./StoryListItem";
import StoryCircleListView from "./StoryCircleListView";
import { isNullOrWhitespace } from "./helpers/ValidationHelpers";
import type { IUserStory } from "./interfaces/IUserStory";
import AndroidCubeEffect from "./AndroidCubeEffect";
import CubeNavigationHorizontal from "./CubeNavigationHorizontal";
import { array } from "prop-types";

type Props = {
    data: IUserStory[],
    currentUserId: null,
    style?: any,
    unPressedBorderColor?: string,
    pressedBorderColor?: string,
    onClose?: function,
    onStart?: function,
    resetIsInputBox?: function,
    duration?: number,
    theme?: string,
    swipeText?: string,
    handleDeleteStory?: any,
    customSwipeUpComponent?: any,
    inputBox?: string,
    customKeyboardPopup?: any,
    customCloseComponent?: any,
    avatarSize?: number,
};

LogBox.ignoreLogs(['Warning: componentWillReceiveProps']); // Ignore log notification by message

export const Story = (props: Props) => {
    const {
        data,
        currentUserId,
        unPressedBorderColor,
        pressedBorderColor,
        style,
        onStart,
        resetIsInputBox,
        onClose,
        duration,
        theme,
        swipeText,
        handleDeleteStory,
        customSwipeUpComponent,
        isInputBox,
        customKeyboardPopup,
        customCloseComponent,
        avatarSize
    } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedData, setSelectedData] = useState([]);
    const [storyIndex, setStoryIndex] = useState(null);
    const [storySeen, setStorySeen] = useState(false);
    const cube = useRef();

    // Component Functions
    const _handleStoryItemPress = (item, index) => {

        // const allStories = data.slice(index);
        let slicedStories = data.slice(1, index); // remove 1st index my-story 
        let allStories = data.slice(index);

        slicedStories.forEach(element => {
            allStories.push(element);
        });
        
        if (onStart) {
            onStart(item)
        }
        // setStoryIndex(index)
        setCurrentPage(0);
        setSelectedData(allStories);
        setIsModalOpen(true);
    };

    function onStoryFinish(state) {
        if (!isNullOrWhitespace(state)) {

            let newPage = currentPage;

            if (state == "next") {
                
                newPage = currentPage + 1;
                
                if (newPage < selectedData.length) {
                    setCurrentPage(newPage);
                    setStorySeen(true)
                    cube?.current?.scrollTo(newPage);
                } else {
                    setIsModalOpen(false);
                    setStorySeen(true)
                    setCurrentPage(0);
                    if (onClose) {
                        onClose(selectedData[selectedData.length - 1]);
                    }
                }
            } else if (state == "previous") {

                newPage = currentPage - 1;

                if (newPage < 0) {
                    setIsModalOpen(false);
                    setCurrentPage(0);
                } else {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                }
            }
        }
    }

    const renderStoryList = () => selectedData.map((x, i) => {
        return (<StoryListItem
            duration={duration * 1000}
            theme={theme}
            key={i}
            currentUserId={currentUserId}
            userID={x.user_id}
            profileName={x.user_name}
            profileImage={x.user_image}
            stories={x.stories}
            currentPage={currentPage}
            onFinish={onStoryFinish}
            swipeText={swipeText}
            handleDeleteStory={handleDeleteStory}
            customSwipeUpComponent={customSwipeUpComponent}
            resetIsInputBox={resetIsInputBox}
            isInputBox={isInputBox}
            customKeyboardPopup={customKeyboardPopup}
            customCloseComponent={customCloseComponent}
            onClosePress={() => {
                setIsModalOpen(false);
                if (onClose) {
                    onClose(x);
                }
            }}
            index={i} />)
    })

    const renderCube = () => {
        if (Platform.OS == 'ios') {
            return (
                <CubeNavigationHorizontal
                    ref={cube}
                    callBackAfterSwipe={(x) => {
                        console.log('callBackAfterSwipe:::::::', currentPage)
                        if (x != currentPage) {
                            setCurrentPage(parseInt(x));
                        }
                    }}
                >
                    {renderStoryList()}
                </CubeNavigationHorizontal>
            )
        } else {
            return (<AndroidCubeEffect
                ref={cube}
                callBackAfterSwipe={(x) => {
                    if (x != currentPage) {
                        setCurrentPage(parseInt(x));
                    }
                }}
            >
                {renderStoryList()}
            </AndroidCubeEffect>)
        }
    }

    return (
        <Fragment>
            <View style={style}>
                <StoryCircleListView
                    handleStoryItemPress={_handleStoryItemPress}
                    data={data}
                    storySeen={storySeen}
                    theme={theme}
                    avatarSize={s(50)}
                    // unPressedBorderColor='#FFF'
                    pressedBorderColor={pressedBorderColor}
                />
            </View>
            <Modal
                style={{
                    flex: 1,
                    height: Dimensions.get("window").height,
                    width: Dimensions.get("window").width
                }}
                isOpen={isModalOpen}
                onClosed={() => setIsModalOpen(false)}
                position="center"
                swipeToClose
                swipeArea={250}
                backButtonClose
                coverScreen={true}
            >
                {renderCube()}
            </Modal>
        </Fragment>
    );
};
export default Story;
