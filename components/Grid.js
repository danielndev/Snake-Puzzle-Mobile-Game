import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

const {height, width} = Dimensions.get('window');

const Grid = props => {  
    const [gridSize, setGridSize] = useState(props.grid.length);
    const [cellSize, setCellSize] = useState(width * 0.2)

    if(props.grid.length != gridSize){
        setGridSize(props.grid.length);
    }

    useEffect(() => {
        setCellSize(width / (gridSize + 1 + Math.floor(gridSize / 4)))
    }, [gridSize])

    const renderRow = (row) => {
        let renderedCells = [];
        for(let i = 0; i < row.length; i ++){
            let cellColour = '#acaec8';

            if(row[i] == 1)
                cellColour = props.snakeColours[0];
            else if(row[i] > 0 ){
                if(props.snakeColours.length > 2){
                    cellColour = props.snakeColours[row[i] % props.snakeColours.length];
                }else
                    cellColour = props.snakeColours[1];
            }
            else if(row[i] < 0)
                cellColour = 'black';

            renderedCells.push(
                <View key={i} style={[styles.cell, {backgroundColor: cellColour}]}>

                </View>
            )
        }
        return renderedCells;
    }

    const renderGrid = () => {
        let renderedRow = [];
        for(let i = 0; i < props.grid.length; i ++){
            renderedRow.push(
                <View key={i} style={styles.row}>
                    {renderRow(props.grid[i])}
                </View>
                
                );
        }

        return renderedRow;
    }


    const styles = StyleSheet.create({
        grid: {
        },
        row: {
            flexDirection: 'row'
        },
        cell: {
            width: cellSize,
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
        }
      });
    return(
        <View style={styles.grid}>
            {renderGrid()}
        </View>        
    )
}

export default Grid;