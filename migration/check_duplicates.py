from difflib import SequenceMatcher
import csv
import re

def similar(x, y):
    return SequenceMatcher(None, x, y).ratio()

files = ['Sheet3.csv', 'export.csv']

with open('id_matched.csv', 'w+', encoding='utf-8') as fw:
    with open('Sheet3.csv', 'r', encoding='utf-8') as fr1:
        with open('export.csv', 'r', encoding='utf-8') as fr2:

            writer = csv.writer(fw, delimiter=',',lineterminator = '\n')
            fr1r = csv.reader(fr1, delimiter=',')
            fr2r = csv.reader(fr2, delimiter=',')
            
            fr2r_titles = [(row[43].lower(), row[20].replace('<i>', "").replace('</i>', "").replace('<em>', "").replace('</em>', ""), row[0]) for row in fr2r]

            for row in fr1r:

                if row[1] == 'book':
                    title = str(row[5]).replace('<i>', "").replace('</i>', "").replace('<em>', "").replace('</em>', "")
                else:
                    title = str(row[4]).replace('<i>', "").replace('</i>', "").replace('<em>', "").replace('</em>', "")
                author = row[0]

                #found = 0
                link = ''
                for i in fr2r_titles:
                    
                    if similar(title, i[1]) >= 0.95 and author == i[0]:
                        link = 'https://lira.bc.edu/work/ns/'+i[2]
                        break

                        #print('https://lira.bc.edu/work/ns/'+i[2])
                        #print(title)
                        #print(i[1])
                        #found += 1
                newrow = [author, title, link]
                writer.writerow(newrow)

                '''
                if found > 1:
                    print(author)
                    print(title)
                    print("MULTIPLES FOUND")
                '''
                
                

                #for row2 in fr2r:

                    #print(title)
                    #print(row2[20])

      