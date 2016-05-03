import os
import glob

files_read = 0
detections = 0
vowels = list("aeiouyAEIOUY")
consonants = list("bcdfghjklmnpqrstvxzBCDFGHJKLMNPQRSTVXZ")
others = list("0123456789!@#$%^&*()_+[]:;',.?/><")
print ""
#for each file in this directory that ends with .js
for filename in glob.glob('*.js'):
    #open file
    f = open(filename, 'r')
    #variable init
    detections_thisFile = 0
    linesRead_thisFile = 0

    #top line of file is file name (strip first two chars as they are '//')
    file_top_line = f.readline()[2:-1]
    print "Opening " + file_top_line

    #next line of file is obfuscator name (strip first two chars as they are '//')
    obfuscator_name = f.readline()[2:-1]
    print "Obfuscator - " + obfuscator_name
    print "================="
    for line in f:
        linesRead_thisFile += 1
        lowered = line.lower()
        if "document.write" in lowered:
            detections_thisFile += 1
            print "Found document.write"
        if "eval(" in lowered:
            detections_thisFile += 1
            print "Found eval()"
        if "p,a,c,k,e,d" in lowered:
            detections_thisFile += 1
            print "Found p,a,c,k,e,d"
        if "p,a,c,k,e,r" in lowered:
            detections_thisFile += 1
            print "Found p,a,c,k,e,r"
        #unescape
        if "unescape" in lowered:
            detections_thisFile += 1
            print "Found unescape"
        #fromCharCode
        if "fromcharcode" in lowered:
            detections_thisFile += 1
            print "Found fromCharCode"
        #analyzing function names
        try :
            functionLocation =  line.index('function')
        except ValueError:
            pass
        else:
            if functionLocation > -1:
                functionNameEnd = line.find('(',functionLocation)
                functionName = line[functionLocation:functionNameEnd]
                #some functions are anonymous and dont have names
                if len(functionName) > 0:
                    #count consonants
                    num_cons = sum(functionName.count(c) for c in consonants)
                    #count vowels
                    num_vwls = sum(functionName.count(c) for c in vowels)
                    #count special chars
                    num_others = sum(functionName.count(c) for c in others)
                    print "Found a function with %d consonants, %d vowels and %d special or numeric characters" % (num_cons, num_vwls, num_others)
                    if (num_cons/num_vwls) > 3:
                        print "High consonants/vowels ratio - Likely obfuscated"
                        detections_thisFile += 1
                    if num_others > 4:
                        print "High use of numbers or special characters - Likely obfuscated"
                        detections_thisFile += 1
                    if len(functionName) > 25:
                        print "Function name is very long - Likely obfuscated"
                        detections_thisFile += 1

        #analyzing variablenames
        try :
            varLocation =  line.index('var')
        except ValueError:
            pass
        else:
            if varLocation > -1:
                varLocation += 4
                spaceAfterVar = line.find(' ',varLocation)
                semicolonAfterVar = line.find(';', varLocation)
                equalsAfterVar = line.find('=', varLocation)
                commaAfterVar = line.find(',', varLocation)
                locationList = [spaceAfterVar, semicolonAfterVar, equalsAfterVar, commaAfterVar]
                for loc in locationList:
                    if loc < 0:
                        locationList.remove(loc)
                varNameEnd = min(locationList)
                varName = line[varLocation:varNameEnd]
                #some vars are anonymous and dont have names
                if len(varName) > 1:
                    print "found a var - %s" % varName
                    #count consonants
                    num_cons = sum(varName.count(c) for c in consonants)
                    #count vowels
                    num_vwls = sum(varName.count(c) for c in vowels)
                    #count special chars
                    num_others = sum(varName.count(c) for c in others)
                    print "Found a var with %d consonants, %d vowels and %d special or numeric characters" % (num_cons, num_vwls, num_others)
                    if num_vwls == 0 or (num_cons/num_vwls) > 3:
                        print "High consonants/vowels ratio - Likely obfuscated"
                        detections_thisFile += 1
                    if num_others > 4:
                        print "High use of numbers or special characters - Likely obfuscated"
                        detections_thisFile += 1
                    if len(varName) > 25:
                        print "Var name is very long - Likely obfuscated"
                        detections_thisFile += 1

    # if detected:
    #     detections = detections + 1
    print "=============="
    print "DETECTIONS - %d" % detections_thisFile
    print "Lines Read - %d" % linesRead_thisFile
    detection_score = detections_thisFile/float(linesRead_thisFile)
    print "Score: %f" % detection_score
    if detection_score > 0.2:
        detections += 1
        print "I think this file is obfuscated!"
    files_read = files_read + 1
    print " "
print "Files read: %d" % files_read
print "Files detected: %d" % detections
print "Detection percentage: %f%%" % ((detections/float(files_read))*100)
