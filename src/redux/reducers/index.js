import {combineReducers} from 'redux';

import index from "./indexReducer"
import main from './mainReducer'

export default combineReducers({
    index,
    main
});