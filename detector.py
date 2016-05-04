import os
import glob

obs_files_read = 0
unobs_files_read = 0
false_positives = 0
missed_detections = 0
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
    detections_this_file = 0
    lines_read_this_file = 0

    #top line of file is file name (strip first two chars as they are '//')
    file_top_line = f.readline()[2:-1]
    print "Opening " + file_top_line

    #next line of file is obfuscator name (strip first two chars as they are '//')
    obfuscator_name = f.readline()[2:-1]

    print "Obfuscator - " + obfuscator_name
    #print "================="
    for line in f:
        lines_read_this_file += 1
        lowered = line.lower()
        if "document.write" in lowered:
            detections_this_file += 1
            #print "Found document.write"
        if "eval(" in lowered:
            detections_this_file += 1
            #print "Found eval()"
        if "p,a,c,k,e,d" in lowered:
            detections_this_file += 1
            #print "Found p,a,c,k,e,d"
        if "p,a,c,k,e,r" in lowered:
            detections_this_file += 1
            #print "Found p,a,c,k,e,r"
        #unescape
        if "unescape" in lowered:
            detections_this_file += 1
            #print "Found unescape"
        #fromCharCode
        if "fromcharcode" in lowered:
            detections_this_file += 1
            #print "Found fromCharCode"

        #analyzing function names
        function_location =  0
        function_location = line.find('function', function_location)
        while function_location > -1:
            function_location += 9
            function_name_end = line.find('(',function_location)
            function_name = line[function_location:function_name_end]
            #some functions are anonymous and dont have names
            if len(function_name) > 0:
                #count consonants
                num_cons = sum(function_name.count(c) for c in consonants)
                #count vowels
                num_vwls = sum(function_name.count(c) for c in vowels)
                #count special chars
                num_others = sum(function_name.count(c) for c in others)
                #print "Found a function with %d consonants, %d vowels and %d special or numeric characters" % (num_cons, num_vwls, num_others)
                if num_vwls == 0 or (num_cons/num_vwls) > 3:
                    #print "High consonants/vowels ratio - Likely obfuscated"
                    detections_this_file += 1
                if num_others > 4:
                    #print "High use of numbers or special characters - Likely obfuscated"
                    detections_this_file += 1
                if len(function_name) > 25:
                    #print "Function name is very long - Likely obfuscated"
                    detections_this_file += 1
            function_location = line.find('function', function_location)

        #analyzing variablenames
        var_location = 0
        var_location =  line.find('var', var_location)
        while var_location > -1:
            var_location += 4
            space_after_var = line.find(' ',var_location)
            semicolon_after_var = line.find(';', var_location)
            equals_after_var = line.find('=', var_location)
            comma_after_var = line.find(',', var_location)
            locationList = [space_after_var, semicolon_after_var, equals_after_var, comma_after_var]
            for loc in locationList:
                if loc < 0:
                    locationList.remove(loc)
            var_name_end = min(locationList)
            var_name = line[var_location:var_name_end]
            #some vars are anonymous and dont have names
            if len(var_name) > 1:
                #print "found a var - %s" % var_name
                #count consonants
                num_cons = sum(var_name.count(c) for c in consonants)
                #count vowels
                num_vwls = sum(var_name.count(c) for c in vowels)
                #count special chars
                num_others = sum(var_name.count(c) for c in others)
                #print "Found a var with %d consonants, %d vowels and %d special or numeric characters" % (num_cons, num_vwls, num_others)
                if num_vwls == 0 or (num_cons/num_vwls) > 3:
                    #print "High consonants/vowels ratio - Likely obfuscated"
                    detections_this_file += 1
                if num_others > 4:
                    #print "High use of numbers or special characters - Likely obfuscated"
                    detections_this_file += 1
                if len(var_name) > 25:
                    #print "Var name is very long - Likely obfuscated"
                    detections_this_file += 1
            var_location =  line.find('var', var_location)


    print "=============="
    print "DETECTIONS - %d" % detections_this_file
    print "Lines Read - %d" % lines_read_this_file
    detection_score = detections_this_file/float(lines_read_this_file)
    print "Score: %f" % detection_score



    if "none" in obfuscator_name:
        unobs_files_read += 1
        if detection_score > 0.2:
            false_positives += 1
    else:
        obs_files_read += 1
        if detection_score > 0.2:
            print "I think this file is obfuscated!"
            detections += 1
        else:
            missed_detections += 1
    print " "
print "Obfuscated files read: %d" % obs_files_read
print "Unobfuscated files read: %d" % unobs_files_read
print "Files detected: %d" % detections
print "Detection percentage: %f%%" % ((detections/float(obs_files_read))*100)
print "False positives: %d" % false_positives
print "Missed detections %d" % missed_detections
