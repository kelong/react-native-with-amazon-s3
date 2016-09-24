package com.tricy.RNAudioPlayer;

import java.util.Map;
import java.util.HashMap;
import java.lang.Exception;

import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.Callback;

import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;

public class RNAudioPlayerModule extends ReactContextBaseJavaModule {
  ReactApplicationContext reactContext;
  MediaPlayer mp;
  Map<String,MediaPlayer> sounds;
  Map<String,Float> soundVolumes;
  public static final String TAG = "-- SOUNDPAD --";

  public RNAudioPlayerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    sounds = new HashMap<>();
    soundVolumes = new HashMap<>();
  }

  @Override
  public String getName() {
    return "RNAudioPlayer";
  }

  @ReactMethod
  public void prepare(String audio) {
    String fname = audio.toLowerCase();
    int resID = this.reactContext.getResources().getIdentifier(fname, "raw", this.reactContext.getPackageName());
    try {
      mp = MediaPlayer.create(this.reactContext, resID);
      sounds.put(audio, mp);
      soundVolumes.put(audio, (float) 1.0);
    } catch(Exception e) {

    }
  }

  public void prepareAndPlay(String audio, boolean loop) {
    this.prepare(audio);
    mp = sounds.get(audio);
    if (mp != null) {
      this.handlePlay(audio, loop);
    }
  }

  @ReactMethod
  public void play(String audio) {
    this.handlePlay(audio, false);
  }

  @ReactMethod
  public void playWithVolume(String audio, float volume) {
    soundVolumes.put(audio, volume);
    this.handlePlay(audio, false);
  }

  @ReactMethod
  public void playWithLoop(String audio) {
    this.handlePlay(audio, true);
  }

  public void handlePlay(final String audio, boolean loop) {
    mp = sounds.get(audio);
    if (mp == null) {
      this.prepareAndPlay(audio, loop);
    } else {
      try {
        mp = sounds.get(audio);
        mp.setLooping(loop);
        Float soundVolume = soundVolumes.get(audio);
        if (soundVolume != null) {
          mp.setVolume(soundVolume, soundVolume);
        }
        mp.start();
        if (!loop) {
          mp.setOnCompletionListener(new OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mp) {
              RNAudioPlayerModule.this.stop(audio);
            }
          });
        }
      } catch (Exception e) {
        
      }
    }
  }

  @ReactMethod
  public void increaseVolume(String audio) {
    mp = sounds.get(audio);
    if (mp != null) try {
      float soundVolume = soundVolumes.get(audio);
      if (soundVolume < 1.0) {
        soundVolume = soundVolume + 0.1f;
      }
      soundVolumes.put(audio, soundVolume);
      mp.setVolume(soundVolume, soundVolume);
    } catch (Exception e) {

    }
  }

  @ReactMethod
  public void decreaseVolume(String audio) {
    mp = sounds.get(audio);
    if (mp != null) try {
      float soundVolume = soundVolumes.get(audio);
      if (soundVolume > 0.0) {
        soundVolume = soundVolume - 0.1f;
      }
      soundVolumes.put(audio, soundVolume);
      mp.setVolume(soundVolume, soundVolume);
    } catch (Exception e) {

    }
  }

  @ReactMethod
  public void pause(String audio) {
    mp = sounds.get(audio);
    if (mp != null) try {
      mp.pause();
    } catch (Exception e) {

    }
  }

  @ReactMethod
  public void stop(String audio) {
    mp = sounds.get(audio);
    if (mp != null) {

      try {
        mp = sounds.get(audio);
        mp.reset();
        mp.release();

        this.prepare(audio);
      } catch (Exception e) {

      }
    }
  }
}
