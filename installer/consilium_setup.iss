[Setup]
AppName=ConsiliumAI
AppVersion=1.0
AppPublisher=Warren Zachary
DefaultDirName={localappdata}\Programs\ConsiliumAI
DefaultGroupName=ConsiliumAI
OutputDir=.
OutputBaseFilename=ConsiliumAI_Setup
Compression=lzma2
SolidCompression=yes
PrivilegesRequired=lowest
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\ConsiliumAI.exe
SetupIconFile=..\consilium.ico
WizardStyle=modern

[Files]
Source: "..\dist\ConsiliumAI\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{autodesktop}\ConsiliumAI"; Filename: "{app}\ConsiliumAI.exe"; Comment: "Launch ConsiliumAI"
Name: "{group}\ConsiliumAI"; Filename: "{app}\ConsiliumAI.exe"
Name: "{group}\Uninstall ConsiliumAI"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\ConsiliumAI.exe"; Description: "Launch ConsiliumAI now"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
