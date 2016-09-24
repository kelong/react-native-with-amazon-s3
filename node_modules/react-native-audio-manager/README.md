# react-native-audio-manager

Audio manager library for react native Android

##Installation

```javascript
npm install react-native-audio-manager --save
```

* In `android/settings.gradle`

```gradle
...
include ':RNAudioPlayer', ':app'
project(':RNAudioPlayer').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-audio-manager/android')
```

* In `android/app/build.gradle`

```gradle
...
dependencies {
  ...
  compile project(':RNAudioPlayer')
}
```

* Register the module (in MainActivity.java)

```java
import com.tricy.RNAudioPlayer.*; // <--- import

public class MainActivity extends Activity implements DefaultHardwareBackBtnHandler {
  ...

  @Override
  protected void onCreate(Bundle savedInstanceState){
    ...
    mReactInstanceManager = ReactInstanceManager.builder()
      .setApplication(getApplicatio)
      ...
      .addPackage(new MainReactPackage())
      .addPackage(new RNAudioPlayer())   //  <--- add here
      ...
  }
}
```

## Usage

Put audio resources in `[project_root]/android/app/src/main/res/raw`

### Example

File: `[project_root]/android/app/src/main/res/raw/hello.mp3`

```javascript

//require module
var AudioPlayer = require('react-native-audio-manager');

//play sound
AudioPlayer.play('hello');

//play sound with volume (0 - 1.0)
AudioPlayer.play('hello', 0.7);

//play sound with loop
AudioPlayer.playWithLoop('hello');

//stop sound
AudioPlayer.stop('hello');

//pause sound
AudioPlayer.pause('hello');

//increase sound volume
AudioPlayer.increaseVolume('hello');

//decrease sound volume
AudioPlayer.decreaseVolume('hello');



```
