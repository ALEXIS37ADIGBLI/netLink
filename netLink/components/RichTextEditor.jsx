import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";
import { theme } from "../constants/theme";

const RichTextEditor = ({ editorRef, onChange }) => {
  return (
    <View style={{ minHeight: 285 }}>
      <RichToolbar
        editor={editorRef}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertLink,
        ]}
        style={styles.richBar}
        selectedIconTint={theme.colors.primaryDark}
        flatContainerStyle={styles.flatStyle}
      />

      <RichEditor
        ref={editorRef}
        containerStyle={styles.rich}
        editorStyle={{
          backgroundColor: "white",
          color: "black",
          placeholderColor: "gray",
          cssText: "body {font-size: 16px;}",
        }}
        placeholder="Votre pensée..."
        onChange={onChange}
        initialHeight={200}
      />
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  richBar: {
    borderTopRightRadius: theme.radius.xl,
    borderTopLeftRadius: theme.radius.xl,
    backgroundColor: theme.colors.lightGray,
  },

  rich: {
    minHeight: 240,
    flex: 1,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    borderColor: theme.colors.darkGray,
    padding: 5,
  },

  flatStyle: {
    paddingHorizontal: 8,
    gap: 3,
  },
});
