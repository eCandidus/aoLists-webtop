cd C:\"Enterprise Candidus"\"aoLists\Webtop"
xcopy *.* C:\Users\JOSEG\Documents\GitHub\aoLists-webtop /Y /S >>nul:
cd C:\Users\JOSEG\Documents\GitHub\aoLists-webtop
rd node_modules /s /q
rd obj /s /q
del npm_link.bat /q
del Webtop.njsproj
