FROM faddat/sos-lite

COPY ./megadrive/light/blurtd.service /etc/systemd/system/blurtd.service
COPY ./megadrive/light/wls.service /etc/systemd/system/wls.service
COPY ./megadrive/light/condenser.service /etc/systemd/system/condenser.service

RUN systemctl enable blurtd && \
        systemctl enable wls && \
        systemctl enable condenser
        