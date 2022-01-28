import React, {Component} from "react";
import {View, FlatList} from "react-native";
import StoryCircleListItem from "./StoryCircleListItem";

class StoryCircleListView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            data,
            storySeen,
            theme,
            handleStoryItemPress,
            unPressedBorderColor,
            pressedBorderColor,
            avatarSize
        } = this.props;

        return (
            <View>
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={data}
                    horizontal
                    style={{paddingLeft: 12}}
                    keyboardShouldPersistTaps='never'
                    keyboardDismissMode="none"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    ListFooterComponent={<View style={{flex: 1, width: 8}}/>}
                    renderItem={({item, index}) => (
                        <StoryCircleListItem
                            avatarSize={avatarSize}
                            index={index}
                            storySeen={storySeen}
                            theme={theme}
                            handleStoryItemPress={() =>
                                handleStoryItemPress && handleStoryItemPress(item, index)
                            }
                            unPressedBorderColor={unPressedBorderColor}
                            pressedBorderColor={pressedBorderColor}
                            item={item}
                        />
                    )}
                />
            </View>
        );
    }
}

export default StoryCircleListView;
