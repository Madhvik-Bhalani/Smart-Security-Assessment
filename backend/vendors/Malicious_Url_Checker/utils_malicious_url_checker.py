def getTokens(input):
    input = input.replace("https://", "").replace("http://", "").rstrip('/')
    tokensBySlash = str(input.encode('utf-8')).split('/')
    allTokens = []
    for i in tokensBySlash:
        tokens = str(i).split('-')
        tokensByDot = []
        for j in range(len(tokens)):
            tempTokens = str(tokens[j]).split('.')
            tokensByDot = tokensByDot + tempTokens
        allTokens = allTokens + tokens + tokensByDot
    common_tokens = [
        'com', 'net', 'org', 'info', 'html', 'htm', 'php', 'asp', 
        'aspx', 'jsp', 'gov', 'edu', 'co', 'us', 'uk', 'de', 'fr', 'jp', 
        'cn', 'au', 'br', 'ca', 'ru', 'it', 'es', 'eu', 'mil', 'biz', 
        'index', 'home', 'main', 'default', 'web', 'online', 'site', 'page', 
        'de', 'app', 'www', 'vercel'
    ]
    allTokens = [token for token in set(allTokens) if token not in common_tokens]
    return allTokens
