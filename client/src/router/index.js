import App from '../App'
import Home from '../pages/Home'
import List from '../pages/List'
import UploadMsg from '../pages/UploadMsg'
import Exchange from '../pages/Exchange'
import Auction from '../pages/Auction'
import OwnAuction from '../pages/OwnAuction'
import Check from '../pages/Check'
import Search from '../pages/Search'
import Test from '../pages/Test'
import React from 'react'
import {BrowserRouter as Router, Routes, Route, Redirect} from 'react-router-dom'

const BaseRouter = () => (
    <Router>
        <Routes>
            <Route path='/' element={<App />}>
                <Route index element={<List />}></Route>
                <Route path='/List' element={<List />}></Route>
                <Route path='/UploadMsg' element={<UploadMsg />}></Route>
                <Route path='/Exchange' element={<Exchange />}></Route>
                <Route path='/Auction' element={<Auction />}></Route>
                <Route path='/OwnAuction' element={<OwnAuction />}></Route>
                <Route path='/Check' element={<Check />}></Route>
                <Route path='/Search' element={<Search />}></Route>
                <Route path='/Test' element={<Test />}></Route>
            </Route>
        </Routes>
    </Router>

)

export default BaseRouter