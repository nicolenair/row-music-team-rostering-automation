  /**   
    * @OnlyCurrentDoc
    */

  /**
 * Gets the values of the cells in the specified range
 * @param {string} spreadsheetId id of the spreadsheet
 * @param {string} range specifying the start and end cells of the range
 * @returns {*} Values in the range
 */

assignMember = function(availabilityDf, roster, week, role, weeks, role_idx, guitar_idx, wl_idx){
  console.log(role, week);
  if(week >=1 && typeof roster[week-1]!=='undefined'){
     qualifiedAvailableMembersList = availabilityDf.filter(function(x){if(JSON.parse(("[" + x[1] + "]")).includes(week) && x[2].includes(role)){return true}else{return false}});
     qualifiedAvailableMembersListD = []
     for(q in qualifiedAvailableMembersList){
      if(!(roster[week-1].filter((x, idx) => x == qualifiedAvailableMembersList[q][0] && !(role=="W/L" && idx == guitar_idx) && !(role="Guitar" && idx==wl_idx)).length > 0)){
        qualifiedAvailableMembersListD.push(qualifiedAvailableMembersList[q]);
      }
     }
     qualifiedAvailableMembersList = qualifiedAvailableMembersListD;
  }else{
    qualifiedAvailableMembersList = availabilityDf.filter(function(x){if(JSON.parse(("[" + x[1] + "]")).includes(week) && x[2].includes(role)){return true}else{return false}});
  }
  // console.log(qualifiedAvailableMembersList);

  if(typeof(qualifiedAvailableMembersList[0]) === "undefined"){
    return "";
  }
  if(week > 1){
      mostRecent = []
      for (m in qualifiedAvailableMembersList){
        ms = []
        // console.log("week", week-1)
        for (w in weeks.slice(0, week-1)){
          if(roster[w].includes(qualifiedAvailableMembersList[m][0])){
            // console.log("week v", roster[w], w, qualifiedAvailableMembersList[m][0]);
            ms.push(Number(w)+1);
          }else{
            ms.push(-100)
          }
        
        
        }
      console.log("ms", ms);
      mostRecent.push(Math.max(...ms));
      }

      // console.log(mostRecent);

      const keys = Array.from(mostRecent.keys()).sort((a, b) => mostRecent[a] - mostRecent[b]);

      const sortedMembers = keys.map(i => qualifiedAvailableMembersList[i]);

      tiedMembers = qualifiedAvailableMembersList.filter((x, idx) => mostRecent[idx] == Math.min(...mostRecent));
      console.log(qualifiedAvailableMembersList, mostRecent, Math.min(...mostRecent));
      console.log("tied", tiedMembers);

      if(tiedMembers.length > 1){
        availableCount = []
        for(m in tiedMembers){
          // console.log("x check", tiedMembers[m][1].toString().split(","));
          availableCount.push(tiedMembers[m][1].toString().split(",").length);
        }
        const keys = Array.from(availableCount.keys()).sort((a, b) => availableCount[a] - availableCount[b]);
        const sortedMembers = keys.map(i => tiedMembers[i]);
        console.log(sortedMembers, mostRecent, qualifiedAvailableMembersList, tiedMembers, availableCount);
        return sortedMembers[0][0];
      }
      
      return sortedMembers[0][0];

      // 

      
  }else{
        availableCount = []
        for(m in qualifiedAvailableMembersList){
          // console.log("x check", qualifiedAvailableMembersList[m][1].toString().split(","));
          availableCount.push(qualifiedAvailableMembersList[m][1].toString().split(",").length);
        }
        const keys = Array.from(availableCount.keys()).sort((a, b) => availableCount[a] - availableCount[b]);
        const sortedMembers = keys.map(i => qualifiedAvailableMembersList[i]);
        console.log(sortedMembers, qualifiedAvailableMembersList, availableCount);
        return sortedMembers[0][0];
  }
};

function readWrite() {
  // This code uses the Sheets Advanced Service, but for most use cases
  // the built-in method SpreadsheetApp.getActiveSpreadsheet()
  //     .getRange(range).getValues(values) is more appropriate.

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Availability");
    const rosterSs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GeneratedRoster");
    // console.log(rosterSs.getRange('A:M').getValues());
    
    const availabilityDf = ss.getRange('A4:C').getValues().filter((word) => word[0].length > 0);
    const requiredRoles = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("helper").getRange('B1:1').getValues()[0].filter((word) => word.length > 0);
    const weeks = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("helper").getRange('B2:2').getValues()[0].filter(Number);

    // const result = ss.getRange('A1').getDisplayValues();
    var roster = Array.from(Array(weeks.length), () => new Array(requiredRoles.length));

    guitar_idx = requiredRoles.indexOf("GUITAR");
    wl_idx = requiredRoles.indexOf("W/L");
    drum_idx = requiredRoles.indexOf("DRUMS");
    bass_idx = requiredRoles.indexOf("BASS");

    for(i in weeks){
      for(e in requiredRoles){
          selectedMember = assignMember(availabilityDf, roster, weeks[i], requiredRoles[e], weeks, e, guitar_idx, wl_idx); //todo
          roster[i][e] = selectedMember;
          console.log("updated roster", roster);

      }
      console.log("criteria", roster[i][drum_idx], roster[i][guitar_idx], roster[i][bass_idx]);
      if(roster[i][drum_idx] == "" && roster[i][guitar_idx] == "" && roster[i][bass_idx] != ""){
        
        roster[i][guitar_idx] = roster[i][bass_idx];
        roster[i][bass_idx] = "";
      }
    }
    // console.log(availabilityDf);
    // console.log(requiredRoles);
    // console.log(weeks);

    rosterSs.clear();
    rosterSs.getRange(1, 2, 1, requiredRoles.length).setValues([requiredRoles]);
    rosterSs.getRange(2, 1, weeks.length, 1).setValues(weeks.map((x) => ["Week " + x]));
    rosterSs.getRange(2, 2, weeks.length, requiredRoles.length).setValues(roster);
  } catch (err) {
    // TODO (developer) - Handle exception
    console.log('Failed with error %s', err.message);
  }
};
