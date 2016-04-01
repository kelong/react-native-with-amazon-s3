import React, {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableHighlight,
    NativeModules,
    Component,
    AlertIOS,
    TextInput,
} from 'react-native';

import { RNS3 } from 'react-native-aws3';
import RNFS from 'react-native-fs';

const ImagePickerManager = NativeModules.ImagePickerManager;
const RNRecordAudio = NativeModules.RNRecordAudio;

const options = {
    title: 'Select Avatar', // specify null or empty string to remove the title
    cancelButtonTitle: 'Cancel',
    takePhotoButtonTitle: 'Take Photo...', // specify null or empty string to remove this button
    chooseFromLibraryButtonTitle: 'Choose from Library...',
    cameraType: 'back', // 'front' or 'back'
    mediaType: 'photo', // 'photo' or 'video'
    videoQuality: 'low', // 'low', 'medium', or 'high'
    durationLimit: 10, // video recording max time in seconds
    maxWidth: 100, // photos only
    maxHeight: 100, // photos only
    aspectX: 2, // android only - aspectX:aspectY, the cropping image's ratio of width to height
    aspectY: 1, // android only - aspectX:aspectY, the cropping image's ratio of width to height
    quality: 0.2, // 0 to 1, photos only
    angle: 0, // android only, photos only
    allowsEditing: false, // Built in functionality to resize/reposition the image after selection
    noData: false,
    storageOptions: { // if this key is provided, the image will get saved in the documents directory on ios, and the pictures directory on android (rather than a temporary directory)
      skipBackup: true, // ios only - image will NOT be backed up to icloud
      path: 'images', // ios only - will save image at /Documents/images rather than the root
  },
};

const aws3Options = {
    keyPrefix: '',
    bucket: 'reactaudioimages',
    region: 'eu-central-1',
    accessKey: 'AKIAJAOPQGGRSKIFR3FA',
    secretKey: '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',
    successActionStatus: 201,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5FCFF',
        flex: 1,
        paddingTop: 40,
        padding: 10,
        alignItems: 'center',
    },
    imageGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    image: {
        width: 100,
        height: 100,
        margin: 10,
    },
    button: {
        height: 50,
        backgroundColor: '#48BBEC',
        alignSelf: 'stretch',
        marginTop: 10,
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 22,
        color: '#FFF',
        alignSelf: 'center',
    },
    textInput: {
        height: 50,
        marginTop: 10,
        padding: 4,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#48bbec',
    },
});

class AudioVideoReactNative extends Component {

    constructor(props) {
        super(props);
        this.state = {
            images: [],
            selected: '',
            textParams: [],
        };

        // RNFS.readDir(RNFS.DocumentDirectoryPath)
        //   .then((result) => {
        //       console.log('GOT RESULT', result);
        //       // stat the first file
        //       return Promise.all([RNFS.stat(result[0].path), result[0].path]);
        //   })
        //   .then((statResult) => {
        //       if (statResult[0].isFile()) {
        //           // if we have a file, read it
        //           return RNFS.readFile(statResult[1], 'utf8');
        //       }
        //       return 'no file';
        //   })
        //   .then((contents) => {
        //       // log the file contents
        //       console.log(contents);
        //   })
        //   .catch((err) => {
        //       console.log(err.message, err.code);
        //   });
    }

    sendFile() {
        ImagePickerManager.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePickerManager Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                // You can display the image using either data:
                // const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

                console.log(response.uri);
                // uri (on iOS)
                const source = { uri: response.uri.replace('file://', ''), isStatic: true };
                // uri (on android)
                // const source = {uri: response.uri, isStatic: true};

                this.setState({
                    avatarSource: source,
                });

                const uriArray = this.state.avatarSource.uri.split('/');
                const name = Array.from(uriArray)
                    .find((item, i) => i === uriArray.length - 1).toString();
                console.log(name);
                const file = {
                    uri: this.state.avatarSource.uri,
                    name,
                    type: 'image/jpeg',
                };

                RNS3.put(file, aws3Options).then(response => {
                    if (response.status !== 201) {
                        AlertIOS.alert(
                            'Upload failed',
                            'Expected HTTP 200 OK response, got '
                                + response.status + '/' + response.responseText
                        );
                        return;
                    }

                    AlertIOS.alert(
                        'Upload successful',
                        'success'
                    );
                });
            }
        });
    }

    getFile() {
        if (!this.state.fileUrl) {
            AlertIOS.alert(
                'Validation error',
                'File url is empty'
            );
            return;
        }

        // RNS3.get(this.state.fileUrl, aws3Options, 'image/jpeg').then(response => {
        //     console.log(response);
        //     if (response.status !== 201) {
        //         AlertIOS.alert(
        //             'Download failed',
        //             'Expected HTTP 200 OK response, got '
        //                 + response.status + '/' + response.responseText
        //         );
        //         return;
        //     }
        //
        //     AlertIOS.alert(
        //         'Download successful',
        //         'success'
        //     );
        // }).catch((error) => {
        //     AlertIOS.alert(
        //         'Error',
        //         error.text
        //     );
        // });
    }

    storeImages(data) {
        const assets = data.edges;
        const images = assets.map((asset) => asset.node.image);
        this.setState({
            images,
        });
    }

    selectImage(uri) {
        NativeModules.ReadImageData.readImage(uri, (image) => {
            this.setState({
                selected: image,
            });
            console.log(image);
        });
    }

    onStartRecording() {
        RNRecordAudio.startRecord(
            'audioFile.m4a',
            (results) => {
                console.log('JS Error: ' + results['errMsg']);
            },
            (results) => {
                console.log('JS Success: ' + results['successMsg']);
                console.log(results);
            }
        );
        AlertIOS.alert('success', 'Recording started');
    }

    onStopRecording() {
        const filename = 'audioFile.m4a';
        RNRecordAudio.stopRecord(
            filename, // filename
            (results) => {
                console.log('JS Error: ' + results['errMsg']);
            },
            (results) => {
                console.log('JS Success: ' + results['successMsg']);
                this.setState({
                    audioFile: filename,
                });
                AlertIOS.alert('success', 'Recording finished');
            }
        );
    }

    onSendAudioFile() {
        const file = {
            uri: RNFS.DocumentDirectoryPath + '/' + this.state.audioFile,
            name: this.state.audioFile,
            type: 'audio/m4a',
        };
        RNS3.put(file, aws3Options).then(response => {
            if (response.status !== 201) {
                AlertIOS.alert(
                    'Upload failed',
                    'Expected HTTP 200 OK response, got '
                        + response.status + '/' + response.responseText
                );
                return;
            }
            AlertIOS.alert(
                'Upload successful',
                'success'
            );
        });
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableHighlight
                    onPress={this.sendFile.bind(this)}
                    style={styles.button}>
                    <Text style={styles.buttonText}>
                        Send image
                    </Text>
                </TouchableHighlight>
                {/*<View style={styles.imageGrid}>
                    <Image source={this.state.avatarSource} style={styles.image} />
                    {this.state.images.map((image) => {
                        return (
                            <TouchableHighlight onPress={this.selectImage.bind(null, image.uri)}>
                                <Image style={styles.image} source={{ uri: image.uri }} />
                            </TouchableHighlight>
                        );
                    })
                }
              </View>*/}
              <TextInput
                  style={styles.textInput}
                  onChangeText={ (text) => this.setState({ fileUrl: text }) }
                  placeholder="Image file url">
              </TextInput>
              <TouchableHighlight
                  onPress={this.getFile.bind(this)}
                  style={styles.button}>
                  <Text style={styles.buttonText}>
                      Get image
                  </Text>
              </TouchableHighlight>
              <TouchableHighlight
                  onPress={this.onStartRecording.bind(this)}
                  style={styles.button}>
                  <Text style={styles.buttonText}>
                      Start audio recording
                  </Text>
              </TouchableHighlight>
              <TouchableHighlight
                  onPress={this.onStopRecording.bind(this)}
                  style={styles.button}>
                  <Text style={styles.buttonText}>
                      Stop audio recording
                  </Text>
              </TouchableHighlight>
              <TouchableHighlight
                  onPress={this.onSendAudioFile.bind(this)}
                  style={styles.button}>
                  <Text style={styles.buttonText}>
                      Send audio file
                  </Text>
              </TouchableHighlight>
          </ScrollView>
      );
    }
}

AppRegistry.registerComponent('AudioVideoReactNative', () => AudioVideoReactNative);
