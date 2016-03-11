/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
global.React = React;

import ReactDOM from 'react-dom';
global.ReactDOM = ReactDOM;

import ol from 'openlayers';
global.ol = ol;

import {IntlProvider} from 'react-intl';
global.IntlProvider = IntlProvider;

import UI from 'pui-react-tabs';
global.UI = UI;

import DD from 'pui-react-dropdowns';
global.DD = DD;

import BUTTON from 'pui-react-buttons';
global.BUTTON = BUTTON;

import AddLayer from './components/AddLayer.jsx';
global.AddLayer = AddLayer;

import App from './components/App.js';
global.App = App;

import Bookmarks from './components/Bookmarks.jsx';
global.Bookmarks = Bookmarks;

import Chart from './components/Chart.jsx';
global.Chart = Chart;

import Edit from './components/Edit.jsx';
global.Edit = Edit;

import EditPopup from './components/EditPopup.jsx';
global.EditPopup = EditPopup;

import FeatureTable from './components/FeatureTable.jsx';
global.FeatureTable = FeatureTable;

import Geocoding from './components/Geocoding.jsx';
global.Geocoding = Geocoding;

import GeocodingResults from './components/GeocodingResults.jsx';
global.GeocodingResults = GeocodingResults;

import Geolocation from './components/Geolocation.jsx';
global.Geolocation = Geolocation;

import Globe from './components/Globe.jsx';
global.Globe = Globe;

import HomeButton from './components/HomeButton.jsx';
global.HomeButton = HomeButton;

import LoadingPanel from './components/LoadingPanel.jsx';
global.LoadingPanel = LoadingPanel;

import ICON from 'pui-react-iconography';
global.ICON = ICON;

import ImageExport from './components/ImageExport.jsx';
global.ImageExport = ImageExport;

import InfoPopup from './components/InfoPopup.jsx';
global.InfoPopup = InfoPopup;

import ToolActions from './actions/ToolActions.js';
global.ToolActions = ToolActions;

import LayerList from './components/LayerList.jsx';
global.LayerList = LayerList;

import Login from './components/Login.jsx';
global.Login = Login;

import LoginModal from './components/LoginModal.jsx';
global.LoginModal = LoginModal;

import Measure from './components/Measure.jsx';
global.Measure = Measure;

import Playback from './components/Playback.jsx';
global.Playback = Playback;

import QGISLegend from './components/QGISLegend.jsx';
global.QGISLegend = QGISLegend;

import QGISPrint from './components/QGISPrint.jsx';
global.QGISPrint = QGISPrint;

import QueryBuilder from './components/QueryBuilder.jsx';
global.QueryBuilder = QueryBuilder;

import Select from './components/Select.jsx';
global.Select = Select;

import Toolbar from './components/Toolbar.jsx';
global.Toolbar = Toolbar;

import WFST from './components/WFST.jsx';
global.WFST = WFST;
