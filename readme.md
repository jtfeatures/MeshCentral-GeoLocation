# MeshCentral-GeoLocation

*Released: 2025-11-13*

MeshCentral plugin to add GeoLocation

## Installation

 Pre-requisite: First, make sure you have plugins enabled for your MeshCentral installation:
   {
     "settings": {
       "plugins": {
         "enabled": true
       }
     },
     "domains": {
       "": {
         "plugins": {
           "geolocation": {
             "enabled": true
           }
         }
       }
     }
   }

Restart your MeshCentral server after making this change.

 To install, simply add the plugin configuration URL when prompted:
 `https://raw.githubusercontent.com/jtfeatures/MeshCentral-GeoLocation/master/config.json`

## Features
Auto adds the location data every XX minutes.
