import streamlit as st

st.set_page_config(page_title="Python AI 課程測試網頁", page_icon="🤖")

st.title("🤖 Python AI 課程測試網頁")
st.write("這是用於 Streamlit 部署測試的互動式網頁，包含課堂教授的三個實作練習。")

option = st.sidebar.selectbox(
    "選擇測試功能",
    ("身分證字號驗證器", "五位整數轉國字大寫", "電話號碼轉國字")
)

if option == "身分證字號驗證器":
    st.header("🪪 中華民國身分證字號驗證器")
    st.write("請輸入身分證字號，系統將會根據身分證驗證規則判斷其有效性。")
    
    user_id = st.text_input("輸入身分證字號 (例如: A123456789)", value="A123456789").upper().strip()
    
    if st.button("驗證"):
        if len(user_id) == 10 and user_id[0].isalpha() and user_id[1:].isdigit():
            base = "ABCDEFGHJKLMNPQRSTUVXYWZIO"
            try:
                prefix = base.index(user_id[0]) + 10
                temp_id = str(prefix) + user_id[1:]
                tot_num = int(temp_id[0]) * 1 + \
                          int(temp_id[1]) * 9 + \
                          int(temp_id[2]) * 8 + \
                          int(temp_id[3]) * 7 + \
                          int(temp_id[4]) * 6 + \
                          int(temp_id[5]) * 5 + \
                          int(temp_id[6]) * 4 + \
                          int(temp_id[7]) * 3 + \
                          int(temp_id[8]) * 2 + \
                          int(temp_id[9]) * 1 + \
                          int(temp_id[10]) * 1
                
                if tot_num % 10 > 0:
                    st.error("❌ 無效的身分證字號")
                else:
                    st.success("✅ 有效的身分證字號")
            except ValueError:
                st.error("❌ 格式錯誤：首字母不符合身分證字號規範")
        else:
            st.warning("⚠️ 請輸入正確的 10 碼身分證格式（1個英文大寫 + 9個數字）")

elif option == "五位整數轉國字大寫":
    st.header("🔢 五位整數轉國字大寫")
    st.write("請輸入一個五位整數（如 12345），系統將會轉換為國字大寫輸出。")
    
    num_input = st.text_input("輸入五位整數", value="12345").strip()
    
    if st.button("轉換"):
        if len(num_input) == 5 and num_input.isdigit():
            cn_str = "零壹貳參肆伍陸柒捌玖"
            n0 = int(num_input[0])
            n1 = int(num_input[1])
            n2 = int(num_input[2])
            n3 = int(num_input[3])
            n4 = int(num_input[4])
            result = cn_str[n0] + cn_str[n1] + cn_str[n2] + cn_str[n3] + cn_str[n4]
            st.info(f"👉 國字大寫結果：**{result}**")
        else:
            st.warning("⚠️ 請輸入剛好五位的正整數數字！")

elif option == "電話號碼轉國字":
    st.header("📞 電話號碼轉國字")
    st.write("請輸入電話號碼，系統將會將其中的數字轉換為中文數字。")
    
    tel_input = st.text_input("輸入電話號碼 (例如: 0912345678)", value="0912345678").strip()
    
    if st.button("轉換電話"):
        tel = tel_input
        tel = tel.replace("0", "〇")
        tel = tel.replace("1", "一")
        tel = tel.replace("2", "二")
        tel = tel.replace("3", "三")
        tel = tel.replace("4", "四")
        tel = tel.replace("5", "五")
        tel = tel.replace("6", "六")
        tel = tel.replace("7", "七")
        tel = tel.replace("8", "八")
        tel = tel.replace("9", "九")
        st.info(f"👉 國字電話結果：**{tel}**")
