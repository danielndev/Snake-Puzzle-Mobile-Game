import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, TouchableOpacity, Dimensions, Modal, FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Font from 'expo-font';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';

import Grid from './components/Grid';

const {height, width} = Dimensions.get('window');
const backgroundColor = '#2a2b32';

const snakeColoursList = [
  {
    colours: ['#009688', '#83d0c9'],
    scoreNeeded: 0
  },{
    colours: ['#fe9c8f', '#fec8c1'],
    scoreNeeded: 10
  },{
    colours: ['#F0F3BD', '#fff5ee'],
    scoreNeeded: 50
  },{
    colours: ['#283655', '#579cff'],
    scoreNeeded: 100
  },{
    colours: ['#ffcc5c', '#88d8b0'],
    scoreNeeded: 250
  },{
    colours: ['#4b3832', '#fff4e6'],
    scoreNeeded: 500
  },{
    colours: ['#2D2A32', '#DDD92A'],
    scoreNeeded: 800
  },{
    colours: ['#BF1A2F', '#454E9E'],
    scoreNeeded: 1200
  },{
    colours: ['#F6F2FF', '#E07BE0'],
    scoreNeeded: 1700
  },{
    colours: ['#38A700', '#3EFF8B'],
    scoreNeeded: 2300
  },{
    colours: ['#880044', '#DD1155'],
    scoreNeeded: 3000
  },{
    colours: ['#FFF8F0', '#92140C'],
    scoreNeeded: 3800
  },{
    colours: ['#FF3CC7', '#F0F600'],
    scoreNeeded: 5000
  },{
    colours: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'],
    scoreNeeded: 10000
  }
]


const startGrid = [
  [-1, 0, 0],
  [0, 1, 0],
  [0, 0, 0]
]

Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

// const iosAdUnitIds = {
//   banner: "ca-app-pub-3940256099942544/2934735716",
//   interstitial: "ca-app-pub-3940256099942544/4411468910",
//   interstitialVideo: "ca-app-pub-3940256099942544/5135589807",
//   rewarded: "ca-app-pub-3940256099942544/1712485313"
// }

// const androidAdUnitIds = {
//   banner: "ca-app-pub-3940256099942544/6300978111",
//   interstitial: "ca-app-pub-3940256099942544/1033173712",
//   interstitialVideo: "ca-app-pub-3940256099942544/8691691433",
//   rewarded: "ca-app-pub-3940256099942544/5224354917"
// }

const iosAdUnitIds = {
  banner: "ca-app-pub-2666108410405288/3929194075",
  interstitial: "ca-app-pub-2666108410405288/2663696941",
  interstitialVideo: "ca-app-pub-3940256099942544/5135589807",
  rewarded: "ca-app-pub-3940256099942544/1712485313"
}

const androidAdUnitIds = {
  banner: "ca-app-pub-2666108410405288/2386874086",
  interstitial: "ca-app-pub-2666108410405288/2195302398",
  interstitialVideo: "ca-app-pub-3940256099942544/8691691433",
  rewarded: "ca-app-pub-3940256099942544/5224354917"
}

const adUnitIds = Platform.OS == "ios" ? iosAdUnitIds : androidAdUnitIds;

export default function App() {
  const [loadedFonts, error] = Font.useFonts({
    Montserrat: require('./assets/Montserrat-Regular.ttf')
  })

  const [inMainMenu, setInMainMenu] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pauseVisible, setPauseVisible] = useState(false);

  const [grid, setGrid] = useState(startGrid)
  const [snakeLength, setSnakeLength] = useState(1);
  const [snakePos, setSnakePos] = useState([1, 1]);
  const [prevSnakePos, setPrevSnakePos] = useState([1, 1]);
  const [gridSize, setGridSize] = useState(3);

  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const [snakeColours, setSnakeColours] = useState(['#009688', '#83d0c9']);

  const [soundEffect, setSoundEffect] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const [removeAds, setRemoveAds] = useState(false)
  useEffect(async () => {
    const { sound } = await Audio.Sound.createAsync(require('./assets/move2.mp3'))
    setSoundEffect(sound);
  }, [])
  useEffect(() => {
    updateGrid();
  }, [snakePos])

  useEffect(() => {
    loadScores();
    loadSnakeColours();
    loadMuted();
  }, [])


  const loadScores = async () => {
    let tScore = await SecureStore.getItemAsync("Total_Score");
    if(tScore)
      setTotalScore(parseInt(tScore)); 

    let hScore = await SecureStore.getItemAsync("High_Score");
    if(hScore)
      setHighScore(parseInt(hScore));
  }

  const saveTotalScore = async totalScore => {
    await SecureStore.setItemAsync("Total_Score", totalScore+ "");
  }

  const saveHighScore = async highScore => {
    await SecureStore.setItemAsync("High_Score", highScore+ "");
  }

  const saveSnakeColours = async snakeColours => {
    await SecureStore.setItemAsync("Snake_Colours", JSON.stringify(snakeColours))
  }

  const loadSnakeColours = async () => {
    let sColours = await SecureStore.getItemAsync('Snake_Colours');
    if(sColours){
      setSnakeColours(JSON.parse(sColours));
    }
  }

  const saveMuted = async () => {
    await SecureStore.setItemAsync("Muted", isMuted ? "true" : "false");
  }

  const loadMuted = async () => {
    let muted = await SecureStore.getItemAsync('Muted');
    if(muted){
      setIsMuted(muted == "true");
    }
  }

  useEffect(() => {
    saveSnakeColours(snakeColours);
  }, [snakeColours])

  useEffect(() => {
    saveMuted();
  },[isMuted])

  const updateGrid = () => {
    let temp = []
    let highestNumber = 0;
    let highestLocationX = 0;
    let highestLocationY = 0;

    for(let i = 0; i < grid.length; i ++){
      temp.push([]);
      for(let j = 0; j < grid[i].length; j ++){
        temp[i].push(grid[i][j] > 0 ? grid[i][j] + 1 : grid[i][j]);
        if(temp[i][j] > highestNumber){
          highestNumber = temp[i][j];
          highestLocationX = j;
          highestLocationY = i;
        }
      }
    }

    let expanded = false;
    if(temp[snakePos[1]][snakePos[0]] >= 0){
      temp[highestLocationY][highestLocationX] = 0;
    }else{
      let numFreeCells = gridSize * gridSize - (snakeLength + 1);

      if(numFreeCells < grid.length){
        temp = expandGrid(temp);
        expanded = true;
        numFreeCells = (gridSize + 2) * (gridSize + 2) - (snakeLength + 1);
      }

      let r = Math.floor(Math.random() * numFreeCells);
      let counter = 0;
      
      for(let i = 0; i < temp.length; i ++){
        for(let j = 0; j < temp[i].length; j ++){
          if(temp[i][j] == 0){
            if(counter == r){
              temp[i][j] = -1;
            }
            counter ++;
          }
        }
      }
      

      setSnakeLength(snakeLength + 1);

      if(score + 1 > highScore){
        setHighScore(score + 1);
        saveHighScore(score + 1);
      }
      setScore(score + 1);
      saveTotalScore(totalScore + 1)
      setTotalScore(totalScore + 1);
    }
 
    if((!expanded && temp[snakePos[1]][snakePos[0]] > 2) || (expanded && temp[snakePos[1] + 1][snakePos[0] + 1] > 2)){
      resetGrid();
    }else{
      if(!expanded)
        temp[snakePos[1]][snakePos[0]] = 1;
      else
        temp[snakePos[1] + 1][snakePos[0] + 1] = 1
      setGrid(temp);
    }
  }

  const resetGrid = async () => {

    setGrid([
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]);
    setSnakeLength(1);
    setSnakePos([1, 1]);
    setPrevSnakePos([1, 1]);
    setGridSize(3);
    setScore(0);

    let r = Math.random();
    if(!removeAds && r < 0.33){
      await AdMobInterstitial.setAdUnitID(adUnitIds.interstitial); // Test ID, Replace with your-admob-unit-id
      await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true});
      await AdMobInterstitial.showAdAsync();
    }
  }

  const expandGrid = t => {
    let temp = [];
    for(let i = 0; i < t.length + 2; i ++){
      temp.push([])
      for(let j = 0; j < t.length + 2; j ++){
          temp[i].push(0);
      }
    }

    for(let i = 0; i < t.length; i ++){
      for(let j = 0; j < t[i].length; j ++){
          temp[i + 1][j + 1] = t[i][j];
        }
      }

    setPrevSnakePos([prevSnakePos[0] + 1, prevSnakePos[1] + 1]);
    setSnakePos([snakePos[0] + 1, snakePos[1] + 1])
    setGridSize(gridSize + 2);
    return temp;
  }

  const moveSnake = direction => {
    let moved = false;
    if(snakePos[0] > 0 && (snakePos[0] - 1 != prevSnakePos[0] || snakeLength == 1) && direction == "SWIPE_LEFT"){
      setPrevSnakePos([snakePos[0], snakePos[1]]);
      setSnakePos([snakePos[0] - 1, snakePos[1]]);
      moved = true;
    }else if(snakePos[0] < grid[0].length - 1 && (snakePos[0] + 1 != prevSnakePos[0] || snakeLength == 1) && direction == "SWIPE_RIGHT"){
      setPrevSnakePos([snakePos[0], snakePos[1]]);
      setSnakePos([snakePos[0] + 1, snakePos[1]]);
      moved = true;
    }else if(snakePos[1] > 0 && (snakePos[1] - 1 != prevSnakePos[1] || snakeLength == 1) && direction == "SWIPE_UP"){
      setPrevSnakePos([snakePos[0], snakePos[1]]);
      setSnakePos([snakePos[0], snakePos[1] - 1]);
      moved = true;
    }else if(snakePos[1] < grid.length - 1 && (snakePos[1] + 1 != prevSnakePos[1] || snakeLength == 1) && direction == "SWIPE_DOWN"){
      setPrevSnakePos([snakePos[0], snakePos[1]]);
      setSnakePos([snakePos[0], snakePos[1] + 1]);
      moved = true;
    }

  
    const playSound = async () => {

      //setSoundEffect(sound);
    
      if(soundEffect){
        soundEffect.setPositionAsync(0)
        soundEffect.setVolumeAsync(0.2)
        await soundEffect.playAsync(); 
        soundEffect.setPositionAsync(0)
      }

    } 
    if(!isMuted)
      playSound();
  
  }

  const calculateDir = (dx, dy) => {
    let dir = null;
    if(Math.abs(dx) > Math.abs(dy)){
      dir = dx > 0 ? "SWIPE_RIGHT" : "SWIPE_LEFT"
    }else{
      dir = dy < 0 ? "SWIPE_UP" : "SWIPE_DOWN"
    }
    
    moveSnake(dir);
  }

  //////////////////////////////////////
  //RENDERING FUNCTIONS
  //////////////////////////////////////

  const render = () => {
    if(inMainMenu)
      return renderMainMenu()

    return renderGame();
  }

  const renderMainMenu = () => {
    return(
      <SafeAreaView style={styles.menuContainer}>
        <View style={styles.menuSnake}>
          <View style={[styles.menuSnakeCell, {backgroundColor: snakeColours[1]}]}>

          </View>
          <View style={[styles.menuSnakeCell, {backgroundColor: snakeColours[1]}]}>

          </View>
          <View style={[styles.menuSnakeCell, {backgroundColor: snakeColours[0]}]}>

          </View>
        </View>
        <TouchableOpacity style={[styles.menuButton, {backgroundColor: snakeColours[0]}]} onPress={() => setInMainMenu(false)}>
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuButton, {backgroundColor: snakeColours[1]}]} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Change Colors</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          {renderChangeColours()}
        </Modal>
      </SafeAreaView>
    )
  }


  
  const renderSelectButton = (colours, scoreNeeded) => {
      if(totalScore < scoreNeeded){
        return (
          <Text style={[styles.colourPickText, {color: 'white'}]}>
            {scoreNeeded - totalScore} to unlock
          </Text>
        )
      }

      return (
        <TouchableOpacity style={styles.snakePickButton} onPress={() => {
          if(!(snakeColours[0] == colours[0] && snakeColours[1] == colours[1])){
            let temp = [];
            for(let i = 0; i < colours.length; i ++){
              temp.push(colours[i]);
            }
            setSnakeColours(temp);
            setModalVisible(false);
          }
        }}>
          <Text style={styles.colourPickText}>
            {(snakeColours[0] == colours[0] && snakeColours[1] == colours[1]) ? "Selected" : "Select"}
          </Text>
        </TouchableOpacity>
      )
  }

  const Item = ({ colours, scoreNeeded }) => (
    <View style={styles.changeColourItem}>
      <View style={styles.colourPickSnake}>
        <View style={[styles.menuSnakeCell, {backgroundColor: colours[0]}]}>

        </View>
        <View style={[styles.menuSnakeCell, {backgroundColor: colours[1]}]}>

        </View> 
      </View>
      {renderSelectButton(colours, scoreNeeded)}
    </View>
  );

  const renderItem = ({ item, index }) => (
    <Item colours={item.colours} scoreNeeded={item.scoreNeeded}/>
  );

  const renderChangeColours = () => {
    return (
        <SafeAreaView  style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.score}>Total Score: {totalScore}</Text>
            <FlatList
              data={snakeColoursList}
              renderItem={renderItem}
              keyExtractor={item => (item.colours[0] + item.colours[1])}
              
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonClose, {backgroundColor: snakeColours[0]}]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView >
    )
  }

  const renderPauseMenu = () => {
    return(
      <View style={[styles.centeredView]}>
        <View style={[styles.pauseView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <TouchableOpacity style={[styles.menuButton, {backgroundColor: snakeColours[0]}]} onPress={() => setPauseVisible(false)}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuButton, {backgroundColor: snakeColours[1]}]} onPress={
            () => {
              setInMainMenu(true);
              setPauseVisible(false)
            }
            }>
            <Text style={styles.buttonText}>Main Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuButton, {backgroundColor: snakeColours[1]}]} onPress={
            () => {
              setIsMuted(!isMuted)
            }
            }>
            <Text style={styles.buttonText}>{isMuted ? 'Sound Off' : 'Sound On'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderBannerAd = () => {
    if(!removeAds){
      return <AdMobBanner
      bannerSize="smartBannerPortrait"
      adUnitID={adUnitIds.banner} // Test ID, Replace with your-admob-unit-id
      servePersonalizedAds={true} // true or false
      onDidFailToReceiveAdWithError={(e) => console.log(e)} />
    }
  }

  const renderTip = () => {
    if(score == 0){
      return(
        <Text style={[styles.score, {fontSize: 16, marginTop: 10}]}>Swipe to move and collect black squares</Text>
      )
    }
  }

  const renderGame = () => {
    return (
      <GestureRecognizer style={styles.container} onSwipe={(dir, state) => calculateDir(state.dx, state.dy)} velocityThreshold = {0.1} directionalOffsetThreshold = {200} >
        <SafeAreaView>
          {renderBannerAd()}
          <TouchableOpacity onPress={() => setPauseVisible(true)}>
            <Icon style={styles.pause} name="pause" size={30} color="white" />
          </TouchableOpacity> 

          <Text style={[styles.score, {fontSize: 24, marginBottom: 20}]}>Best    {highScore}</Text>
          <Text style={styles.score}>{score}</Text>
          {renderTip()}
          <View style={styles.gridContainer}>
            <Grid grid={grid} snakeLength={snakeLength} snakeColours={snakeColours}/>
          </View>
        </SafeAreaView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={pauseVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!pauseVisible);
          }}
        >
          {renderPauseMenu()}
        </Modal>
      </GestureRecognizer>
    )
  }

  return render();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2b32',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  score: {
    fontSize: 40,
    marginTop: 10,
    textAlign: 'center',
    color: 'white',
    fontFamily:"Montserrat"
  },
  pause: {
    fontSize: 32,
    marginTop: 10,
    padding: 10
  },
  gridContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: 'center',
    // justifyContent: 'center'
  },
  menuSnake: {
    width: "100%",
    height: "20%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height*0.15,
    marginBottom: height*0.15
  },
  menuSnakeCell: {
    width: width * 0.2,
    aspectRatio: 1,

    margin: 2,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 4.65,

    elevation: 7,
  },
  menuButton: {
    width: "75%",
    aspectRatio: 5,

    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 4.65,

    elevation: 7,
    marginBottom: 10
  },
  buttonText: {
    fontSize: 32
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  
  },
  modalView: {
    flex: 1,

    width: "100%",
    height: '100%',
    backgroundColor: backgroundColor,
    borderRadius: 20,
   

  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily:"Montserrat"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily:"Montserrat"
  },
  changeColourItem:{
    flexDirection: 'row',
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  colourPickSnake: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  snakePickButton: {
    width: "40%",
    //height: "50%",
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  colourPickText: {
    textAlign: 'center',
    fontSize: 24,
    padding: 10,
    fontFamily:"Montserrat"
  },
  backButtonText: {
    textAlign: 'center',
    fontSize: 24,
  },
  pauseView: {
    flex: 1,
    width: "100%",
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: backgroundColor,
    borderRadius: 20,
    padding: 20,

  },
});
