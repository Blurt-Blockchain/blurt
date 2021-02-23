//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
//// react navigation
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {argonTheme} from '~/constants/argonTheme';
import {Block, Text, Icon} from 'galio-framework';
import DraggableFlatList from 'react-native-draggable-flatlist';
//// contexts
import {
  AuthContext,
  PostsContext,
  SettingsContext,
  UIContext,
} from '~/contexts';
import {PostData, PostRef, PostsTypes, ProfileData} from '~/contexts/types';
//// etc

//// props
interface Props {
  data: any[];
  renderItem: (item: any) => JSX.Element;
  onRefresh: () => void;
}
//// component
const DraggableListView = (props: Props): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const _onRefresh = async () => {
    setLoading(true);
    await props.onRefresh();
    setLoading(false);
  };

  //// contexts
  // return (
  //   <View style={{flex: 1}}>
  //     <DraggableFlatList
  //       style={{marginTop: 15, marginHorizontal: 20}}
  //       data={props.data}
  //       renderItem={props.renderItem}
  //       keyExtractor={(item, index) => `draggable-item-${item.author}`}
  //       onDragBegin={() => console.log('onDragBegin')}
  //       onDragEnd={({data}) => console.log('drag end data', data)}
  //     />
  //   </View>
  // );
  return !loading ? (
    <FlatList
      contentContainerStyle={{
        marginTop: 15,
        marginHorizontal: 5,
        paddingBottom: 20,
      }}
      data={props.data}
      renderItem={props.renderItem}
      refreshing={refreshing}
      onRefresh={_onRefresh}
      keyExtractor={(item, index) => String(index)}
      initialNumToRender={5}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <View style={{top: 20}}>
      <ActivityIndicator color={argonTheme.COLORS.ERROR} size="small" />
    </View>
  );
};

export {DraggableListView};
