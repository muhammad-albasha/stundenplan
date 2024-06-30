!ifdef BUILD_UNINSTALLER
  Function un.AddAppData
    ; Remove app data if user checked the option
    RMDir /r "$APPDATA\Stundenplan+"
    RMDir /r "$LOCALAPPDATA\Stundenplan+"
    RMDir /r "$INSTDIR"
  FunctionEnd

  ; Using the read me setting to add option to remove app data
  !define MUI_FINISHPAGE_SHOWREADME
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Remove user data"
  !define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
  !define MUI_FINISHPAGE_SHOWREADME_FUNCTION un.AddAppData

!macro customInstall
  ; Remove dangling reference of version 1.0.0
  ${If} $installMode == "all"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\66bed7da-e601-54e6-b2e8-7be611d82556"
  ${Else}
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\66bed7da-e601-54e6-b2e8-7be611d82556"
  ${EndIf}
!macroend

!macro preInit
 SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Stundenplan"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Stundenplan"
 SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Stundenplan"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Stundenplan"
!macroend

!endif