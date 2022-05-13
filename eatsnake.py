import PySimpleGUI as sg
import webbrowser
from importlib_metadata import NullFinder
from pymysql import connect, Error

sg.theme('DarkAmber')   
layout = [  [sg.Text('Username'),sg.InputText('UserName')],
            [sg.Text('Password'),sg.InputText('password')],
            [sg.Button('Login',size=(10, 1)), 
             sg.Radio('Play with an account     ', "RADIO1", default=True, size=(15, 1)),
             sg.Radio('Play as a guest', "RADIO1",size=(15, 1))],
            [sg.Button('Show List',size=(10, 1))]
            ]

root_window = sg.Window('Login', layout)


while True:
    event, values = root_window.read()
    if event == None:
        break
    if event == 'Login':
        #values[2] 的值为True，使用用户名和密码登录
        if(values[2]):
            username = values[0]
            '''
            To do
            根据用户名获取服务器上的密码,正确的密码储存在right_password中            
            '''
            conn = None

            try:
                # 建立连接
                conn = connect(
                    host='localhost',
                    user='root',
                    password='password',
                    database='db'  
                    ) 
                #返回是否可以登录
                
                right_password=''
                with conn:
                    with conn.cursor()  as cursor:
                        sql = 'select password from users where userName = \''+ username + '\''
                        print("a")
              # 执行sql
                        cursor.execute(sql)
               # 提交事务
                        all_data = cursor.fetchall()
                        for items in all_data :
                            print (items)
                            right_password = items[0]

                conn.commit()
            except Error as e:
                print('连接失败：{}')
                print(e)


            password = values[1]
            if(password == right_password):       
                webbrowser.open_new_tab('eatSnake.html')
            else:
                text=''' Incorrect Username or password, please try again '''
                sg.popup_scrolled(text,title='Invalid login')
        #values[2] 的值为False，直接打开游戏
        else:
            webbrowser.open_new_tab('eatSnake.html')
            root_window.close()#if guest, close the window
    if event == 'Show List':
        '''
        To do
        获取Top10 list，用户名和分数按顺序储存在toplist和scores中，            
        '''
        try:
            # 建立连接
            conn = connect(
            host='localhost',
            user='root',
            password='password',
            database='db'  
            ) 
   #查询前一百的数据
            with conn:
                scores = []
                with conn.cursor()  as cursor:
                    sql = 'select score from users order by score desc limit 10'
              # 执行sql
                    cursor.execute(sql)
               # 提交事务
                    all_data = cursor.fetchall()
                for item in all_data :
                       scores.append(item[0])
                conn.commit()


                toplist = []
                with conn.cursor()  as cursor:
                    sql = 'select userName from users order by score desc limit 10'
              # 执行sql
                    cursor.execute(sql)
               # 提交事务
                    all_data = cursor.fetchall()
                    for item in all_data :
                       toplist.append(item[0])
                conn.commit()
        except Error as e:
            print(e)
            print('连接失败：{}')

        #display the top ten accounts
        list_window_active = True
        root_window.Hide()
        layout2 = [[sg.Text("Username"), sg.Text("scores")],
                   [sg.Text(toplist[0]), sg.Text(scores[0])],  
                   [sg.Text(toplist[1]), sg.Text(scores[1])],
                   [sg.Text(toplist[2]), sg.Text(scores[2])],
                   [sg.Text(toplist[3]), sg.Text(scores[3])],
                   [sg.Text(toplist[4]), sg.Text(scores[4])],
                   [sg.Text(toplist[5]), sg.Text(scores[5])],
                   [sg.Text(toplist[6]), sg.Text(scores[6])],
                   [sg.Text(toplist[7]), sg.Text(scores[7])],
                   [sg.Text(toplist[8]), sg.Text(scores[8])],
                   [sg.Text(toplist[9]), sg.Text(scores[9])],# note must create a layout from scratch every time. No reuse
                   [sg.Button('OK')]]

        list_window = sg.Window('Top10 List', layout2)
        while True:
            ev2, vals2 = list_window.read()
            if ev2 == sg.WIN_CLOSED or ev2 == 'OK':
                list_window.close()
                list_window_active = False
                root_window.UnHide()
                break

root_window.close()
