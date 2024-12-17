import joblib

def predict_with_model(X_predict):
    # Load Model and Vectorizer for Prediction
    loaded_model = joblib.load("vendors/Malicious_Url_Checker/url_detection_3.pkl")       # Load trained model
    loaded_vectorizer = joblib.load("vendors/Malicious_Url_Checker/vectorizer_3.pkl")     # Load vectorizer
    loaded_label_encoder = joblib.load("vendors/Malicious_Url_Checker/label_encoder_3.pkl")  # Load label encoder


    # Transform input URL using the loaded vectorizer
    X_predict_transformed = loaded_vectorizer.transform(X_predict)

    # Predict the label using the loaded model
    y_predict = loaded_model.predict(X_predict_transformed)

    # Decode the predicted label to its original form
    decoded_label = loaded_label_encoder.inverse_transform(y_predict)

    return decoded_label


# Function to normalize URLs
def normalize_url(urls):
    # Remove 'http://', 'https://', and 'www.'
    result = []
    for url in urls:
        url = url.lower().replace('http://', '').replace('https://', '').replace('www.', '')
        result.append(url.strip('/'))
    return result

list_of_good_urls = ['campus.tu-chemnitz.de/qisserver/pages/cs/sys/portal/hisinoneStartPage.faces?navigationPosition=link_homepage&recordRequest=true',
'campus.tu-chemnitz.de',
'https://team-codefinity.vercel.app/',
'https://tu-chemnitz.de/index.html.en'
]

    
# result of output
# ['benign' 'defacement' 'malware' 'phishing']

def check_url(search_urls):
    
    result_df = []
    #print(search_urls)
    
    remain_url =[]
    
    normalize_search_url = normalize_url(search_urls)
    
    list_of_good_normalize_urls = normalize_url(list_of_good_urls)
    
    # see the if url is good by users
    for url in normalize_search_url:
        if url in list_of_good_normalize_urls:
            result_df.append([url, 'benign'])
        else:
            remain_url.append(url)
            
    if remain_url:
        result_model = predict_with_model(remain_url)
    
        for url, result in zip(remain_url, result_model):
            result_df.append([url, result])
    
    return result_df
    
# print(check_url(['mail.printakid.com/www.online.americanexpress.com/index.html']))
