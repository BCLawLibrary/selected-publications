import requests
from bs4 import BeautifulSoup
from selenium import webdriver
import time
import csv
import re

faculty = [
    'alan_minuskin',
    'alfred_yen',
    'bijal_shah',
    'brian_quinn',
    'charles_baron',
    'cheryl-bratt',
    'donohue',
    'cynthia_lichtenstein',
    'daniel-farbman',
    'daniel_kanstroom',
    'daniel_lyons',
    'daniel_coquillette',
    'david_wirth',
    'david_olson',
    'dean_hashimoto',
    'diane_ring',
    'joan_blum',
    'elisabeth_keller',
    'evangeline_sarda',
    'felipe-fordcole',
    'filippa_anzalone',
    'francine_sherman',
    'frank_garcia',
    'frank_herrmann',
    'george_brown',
    'gregory_kalscheur',
    'hiba-hafiz',
    'ingrid_hillinger',
    'joseph_liu',
    'judith_mcmorrow',
    'judith_tracy',
    'katharine_young',
    'hugh_ault',
    'ingrid_hillinger',
    'james_repetti',
    'james_rogers',
    'jane_gionfriddo',
    'jeffrey-cohen',
    'jenna-cobb',
    'kent_greenfield',
    'lisa-t-alexander',
    'mark_brodin',
    'mark_spiegel1',
    'maryann_chirba',
    'mary_holper',
    'mary_bilder',
    'maureen-vanneste',
    'kaveny',
    'natalya_shnitser',
    'norah_wylie',
    'patricia_mccoy1',
    'paulo_barrozo',
    'paul_tremblay',
    'ray_madoff',
    'reena_parikh',
    'renee_jones',
    'r_michael_cassidy',
    'robert_bloom',
    'ruth-arlene_howe',
    'ryan-williams',
    'sanford_katz',
    'scott_fitzgibbon',
    'sharon_beckman',
    'sharon_oconnor',
    'shu-yi-oei',
    'thomas_kohler',
    'vincent_rougeau',
    'vlad_perju',
    'zygmunt_plater'
]



'''
def pageExists(name):
    URL = 'https://works.bepress.com/' + name
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'lxml')
    errorContent = soup.find(class_='error-content')
    if errorContent == None:
        return True
    else:
        return False


with open('author_links_first_half.csv', 'w+', newline='') as csvfile:
    write = csv.writer(csvfile, delimiter=',')

    for name in faculty:
        URL = 'https://works.bepress.com/' + name
        browser = webdriver.Firefox()
        browser.get(URL)
        lenOfPage = browser.execute_script("window.scrollTo(0, document.body.scrollHeight);var lenOfPage=document.body.scrollHeight;return lenOfPage;")
        match=False
        while(match==False):
            lastCount = lenOfPage
            time.sleep(1)
            lenOfPage = browser.execute_script("window.scrollTo(0, document.body.scrollHeight);var lenOfPage=document.body.scrollHeight;return lenOfPage;")
            if lastCount==lenOfPage:
                match=True

        # Now that the page is fully scrolled, grab the source code.
        source_data = browser.page_source

        # page = requests.get(URL)
        #soup = BeautifulSoup(page.content, 'lxml')
        soup = BeautifulSoup(source_data)
        works = soup.find_all(class_='list-summary')
        for work in works:
            link = work.find('a', href=True).get('href')
            write.writerow([link])
            print(link)
'''


allowed_types = ['Book', 'Article', 'Contribution to Book']

with open('author_links_first_half.csv', 'r') as csvfile:
    with open('works_info_first_half.csv', 'w+', newline='', encoding='utf-8') as writtenfile:
        read = csv.reader(csvfile, delimiter=',')
        write = csv.writer(writtenfile, delimiter=',')
        for row in read:
            URL = 'https://works.bepress.com/'+row[0]
            print('\n\n\n\n')
            print(URL)
            page = requests.get(URL)
            soup = BeautifulSoup(page.content, 'lxml')
            work_header = soup.find(class_='work-details-header')
            try:
                content_type = work_header.find(class_='content-type').string.lstrip().rstrip()
            except:
                content_type = "Error"

            if content_type in allowed_types:
                
                print('Allowed Type')
                row = []
                work_title = work_header.find(class_='work-details-title').string
                authors = [i.string for i in work_header.find_all(class_='author')]
                work_details = soup.find(class_='work-details')
                citation = work_details.find(class_='citation')
                year = ''
                try:
                    publication_date = str(soup.find(class_='publication-date'))
                    year = re.findall('(\d{4})', publication_date)[-1]
                except:
                    try:
                        publication_date = str(soup.find(class_='publication-date-display'))
                        year = re.findall('(\d{4})', publication_date)[-1]
                    except:
                        year = 1500

                main_author = ''
                try:
                    main_author = authors[0]
                    coauthors = ';'.join(authors[1:])
                except:
                    main_author =''
                    coauthors=''

                row.append('')
                row.append(content_type.lower())
                row.append(main_author)
                row.append(coauthors)
                row.append(work_title)
                
                citation = re.sub(r"[\n\t]*", "", str(citation))
                citation = citation.replace('<div class="citation"><div class="section-title">Citation Information</div>', '')
                citation = citation.split('<br/>')[0].lstrip(' ')
                row.append(citation)
                row.append('')
                row.append('')
                row.append('')
                row.append('')
                row.append(year)
                for i in row:
                    print(re.sub(r"[\n\t]*", "", str(i)))
                write.writerow(row)
            else:
                print('Disallowed Type')
                print(content_type)
                