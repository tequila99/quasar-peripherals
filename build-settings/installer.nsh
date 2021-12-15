!include nsDialogs.nsh
!include LogicLib.nsh
;XPStyle on
Var hCtl_nsis_dialog
Var hCtl_nsis_dialog_Label1
Var hCtl_nsis_dialog_CheckBox1
Var hCtl_nsis_dialog_Font1
Var CheckboxState
;
Page custom nsDialogsPage nsDialogsPageLeave ; "Включить модуль работы со СмартКартами ?" <- title
Function nsDialogsPage
  CreateFont $hCtl_nsis_dialog_Font1 "Microsoft Sans Serif" "12" "700"
  ; === nsis_dialog (type: Dialog) ===
  nsDialogs::Create 1018
  Pop $hCtl_nsis_dialog
  ${If} $hCtl_nsis_dialog == error
    Abort
  ${EndIf}
  ;!insertmacro MUI_HEADER_TEXT "Dialog title..." "Dialog subtitle..."
  ; === Label1 (type: Label) ===
  ${NSD_CreateLabel} 25u 21u 233u 41u "Включите модуль картридера, только если у вас установлен считыватель СмартКарт."
  Pop $hCtl_nsis_dialog_Label1
  SendMessage $hCtl_nsis_dialog_Label1 ${WM_SETFONT} $hCtl_nsis_dialog_Font1 0
  ; === CheckBox1 (type: Checkbox) ===
  ${NSD_CreateCheckbox} 68u 74u 154u 28u "Включить модуль картридера"
  Pop $hCtl_nsis_dialog_CheckBox1
  StrCpy $CheckboxState ${BST_UNCHECKED} ; Set initial/default state
  ${NSD_SetState} $hCtl_nsis_dialog_CheckBox1 $CheckboxState
  nsDialogs::Show
FunctionEnd
Function nsDialogsPageLeave
  ${NSD_GetState} $hCtl_nsis_dialog_CheckBox1 $CheckboxState
FunctionEnd
;Function .onInstSuccess
Function .onGUIEnd
   FileOpen $9 $INSTDIR\resources\config.json w
   FileWrite $9 "{"
   FileWrite $9 "$\r$\n"
   FileWrite $9 `"useCardReader": `
   ;FileWrite $9 $CheckboxState
   ${If} $CheckboxState == 1
     FileWrite $9 "true"
   ${Else}
     FileWrite $9 "false"
   ${EndIf}
   FileWrite $9 ","
   FileWrite $9 "$\r$\n"
   FileWrite $9 `"rvReqChecker": false`
   FileWrite $9 "$\r$\n"
   FileWrite $9 "}"
   FileClose $9
   ; сделать конфиг скрытым и реадонли
   ;SetFileAttributes $INSTDIR\resources\config.json HIDDEN|READONLY
FunctionEnd
